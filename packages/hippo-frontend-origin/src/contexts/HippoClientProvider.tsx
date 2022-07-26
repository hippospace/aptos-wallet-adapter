import { createContext, FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { hippoSwapClient, hippoWalletClient } from 'config/hippoWalletClient';
import {
  HippoSwapClient,
  HippoWalletClient,
  PoolType,
  UITokenAmount,
  aptos_framework
} from '@manahippo/hippo-sdk';
import { token_registry$_ } from '@manahippo/hippo-sdk/dist/generated/token_registry';
import useAptosWallet from 'hooks/useAptosWallet';
// import { aptosClient } from 'config/aptosClient';
import { message, notification } from 'components/Antd';
import { TTransaction } from 'types/hippo';
import { useWallet } from '@manahippo/aptos-wallet-adapter';
import { MaybeHexString } from 'aptos';

interface HippoClientContextType {
  hippoWallet?: HippoWalletClient;
  hippoSwap?: HippoSwapClient;
  tokenStores?: Record<string, aptos_framework.coin$_.CoinStore>;
  tokenInfos?: Record<string, token_registry$_.TokenInfo>;
  requestSwap: (
    fromSymbol: string,
    toSymbol: string,
    uiAmtIn: number,
    uiAmtOutMin: number,
    callback: () => void
  ) => {};
  requestDeposit: (
    lhsSymbol: string,
    rhsSymbol: string,
    poolType: PoolType,
    lhsUiAmt: number,
    rhsUiAmt: number,
    callback: () => void
  ) => {};
  requestWithdraw: (
    lhsSymbol: string,
    rhsSymbol: string,
    poolType: PoolType,
    liqiudityAmt: UITokenAmount,
    lhsMinAmt: UITokenAmount,
    rhsMinAmt: UITokenAmount,
    callback: () => void
  ) => {};
  transaction?: TTransaction;
  setTransaction: (trans?: TTransaction) => void;
  requestFaucet: (symbol: string, callback?: () => void) => void;
}

interface TProviderProps {
  children: ReactNode;
}

const openNotification = (txhash: MaybeHexString) => {
  notification.open({
    message: 'Transaction Success',
    description: (
      <p>
        You can verify the transaction by visiting the{' '}
        <a
          href={`https://explorer.devnet.aptos.dev/txn/${txhash}`}
          target="_blank"
          rel="noreferrer"
          className="underline">
          Aptos Transaction Explorer
        </a>
      </p>
    ),
    placement: 'bottomLeft'
  });
};

const HippoClientContext = createContext<HippoClientContextType>({} as HippoClientContextType);

const HippoClientProvider: FC<TProviderProps> = ({ children }) => {
  const { activeWallet } = useAptosWallet();
  const { signAndSubmitTransaction } = useWallet();
  const [hippoWallet, setHippoWallet] = useState<HippoWalletClient>();
  const [hippoSwap, setHippoSwapClient] = useState<HippoSwapClient>();
  const [refresh, setRefresh] = useState(false);
  const [transaction, setTransaction] = useState<TTransaction>();
  const [tokenStores, setTokenStores] =
    useState<Record<string, aptos_framework.coin$_.CoinStore>>();
  const [tokenInfos, setTokenInfos] = useState<Record<string, token_registry$_.TokenInfo>>();

  const requestFaucet = useCallback(
    async (symbol: string, callback?: () => void) => {
      try {
        if (!activeWallet) throw new Error('Please login first');
        if (symbol !== 'APTOS') {
          const uiAmtUsed = symbol === 'BTC' ? 0.01 : 10;
          const payload = await hippoWallet?.makeFaucetMintToPayload(uiAmtUsed, symbol);
          if (payload) {
            const result = await signAndSubmitTransaction(payload);
            if (result) {
              openNotification(result.hash);
              await hippoWallet?.refreshStores();
              setRefresh(true);
              if (callback) callback();
            }
          }
        }
      } catch (error) {
        console.log('request faucet error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [activeWallet, hippoWallet, signAndSubmitTransaction]
  );

  const getHippoWalletClient = useCallback(async () => {
    if (activeWallet) {
      const client = await hippoWalletClient(activeWallet);
      setHippoWallet(client);
    }
  }, [activeWallet]);

  const getHippoSwapClient = useCallback(async () => {
    const sClient = await hippoSwapClient();
    setHippoSwapClient(sClient);
  }, []);

  useEffect(() => {
    getHippoWalletClient();
    getHippoSwapClient();
  }, [getHippoWalletClient, getHippoSwapClient]);

  useEffect(() => {
    if (hippoWallet) {
      setTokenStores(hippoWallet?.symbolToCoinStore);
      setTokenInfos(hippoWallet?.symbolToTokenInfo);
      if (refresh) {
        getHippoWalletClient();
        setRefresh(false);
      }
    }
  }, [hippoWallet, refresh, getHippoWalletClient]);

  const requestSwap = useCallback(
    async (
      fromSymbol: string,
      toSymbol: string,
      uiAmtIn: number,
      uiAmtOutMin: number,
      callback: () => void
    ) => {
      try {
        if (!activeWallet || !hippoSwap) throw new Error('Please login first');
        if (uiAmtIn <= 0) {
          throw new Error('Input amount needs to be greater than 0');
        }
        const bestQuote = await hippoSwap.getBestQuoteBySymbols(fromSymbol, toSymbol, uiAmtIn, 3);
        if (!bestQuote) {
          throw new Error(`No route exists from ${fromSymbol} to ${toSymbol}`);
        }
        const payload = await bestQuote.bestRoute.makeSwapPayload(uiAmtIn, uiAmtOutMin);
        console.log('request swap payload', payload);
        const result = await signAndSubmitTransaction(payload);
        if (result) {
          message.success('Transaction Success');
          setRefresh(true);
          callback();
        }
      } catch (error) {
        console.log('request swap error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [hippoSwap, activeWallet, signAndSubmitTransaction]
  );

  const requestDeposit = useCallback(
    async (
      lhsSymbol: string,
      rhsSymbol: string,
      poolType: PoolType,
      lhsUiAmt: number,
      rhsUiAmt: number,
      callback: () => void
    ) => {
      try {
        if (!activeWallet || !hippoSwap) {
          throw new Error('Please login first');
        }
        const pool = hippoSwap.getDirectPoolsBySymbolsAndPoolType(lhsSymbol, rhsSymbol, poolType);
        if (pool.length === 0) {
          throw new Error('Desired pool does not exist');
        }
        const payload = await pool[0].makeAddLiquidityPayload(lhsUiAmt, rhsUiAmt);
        const result = await signAndSubmitTransaction(payload);
        if (result) {
          message.success('Transaction Success');
          setRefresh(true);
          callback();
        }
      } catch (error) {
        console.log('request deposit error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [hippoSwap, activeWallet, signAndSubmitTransaction]
  );

  const requestWithdraw = useCallback(
    async (
      lhsSymbol: string,
      rhsSymbol: string,
      poolType: PoolType,
      liqiudityAmt: UITokenAmount,
      lhsMinAmt: UITokenAmount,
      rhsMinAmt: UITokenAmount,
      callback: () => void
    ) => {
      try {
        if (!activeWallet || !hippoSwap) {
          throw new Error('Please login first');
        }
        const pool = hippoSwap.getDirectPoolsBySymbolsAndPoolType(lhsSymbol, rhsSymbol, poolType);
        if (pool.length === 0) {
          throw new Error('Desired pool does not exist');
        }
        const payload = await pool[0].makeRemoveLiquidityPayload(
          liqiudityAmt,
          lhsMinAmt,
          rhsMinAmt
        );
        const result = await signAndSubmitTransaction(payload);
        if (result) {
          message.success('Transaction Success');
          setRefresh(true);
          callback();
        }
      } catch (error) {
        console.log('request withdraw error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [hippoSwap, activeWallet, signAndSubmitTransaction]
  );

  return (
    <HippoClientContext.Provider
      value={{
        hippoWallet,
        hippoSwap,
        tokenStores,
        tokenInfos,
        requestSwap,
        requestDeposit,
        requestWithdraw,
        transaction,
        setTransaction,
        requestFaucet
      }}>
      {children}
    </HippoClientContext.Provider>
  );
};

export { HippoClientProvider, HippoClientContext };

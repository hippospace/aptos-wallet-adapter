import { createContext, FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { hippoSwapClient, hippoWalletClient } from 'config/hippoWalletClient';
import {
  HippoSwapClient,
  HippoWalletClient,
  PoolType,
  UITokenAmount,
  X0x1
} from '@manahippo/hippo-sdk';
import { TokenRegistry } from '@manahippo/hippo-sdk/dist/generated/X0xf70ac33c984f8b7bead655ad239d246f1c0e3ca55fe0b8bfc119aa529c4630e8';
import useAptosWallet from 'hooks/useAptosWallet';
// import { aptosClient } from 'config/aptosClient';
import { message } from 'components/Antd';
import { TTransaction } from 'types/hippo';
import { useWallet } from 'components/WalletAdapter/useWallet';

interface HippoClientContextType {
  hippoWallet?: HippoWalletClient;
  hippoSwap?: HippoSwapClient;
  tokenStores?: Record<string, X0x1.Coin.CoinStore>;
  tokenInfos?: Record<string, TokenRegistry.TokenInfo>;
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

const HippoClientContext = createContext<HippoClientContextType>({} as HippoClientContextType);

const HippoClientProvider: FC<TProviderProps> = ({ children }) => {
  const { activeWallet } = useAptosWallet();
  const { signAndSubmitTransaction } = useWallet();
  const [hippoWallet, setHippoWallet] = useState<HippoWalletClient>();
  const [hippoSwap, setHippoSwapClient] = useState<HippoSwapClient>();
  const [refresh, setRefresh] = useState(false);
  const [transaction, setTransaction] = useState<TTransaction>();
  const [tokenStores, setTokenStores] = useState<Record<string, X0x1.Coin.CoinStore>>();
  const [tokenInfos, setTokenInfos] = useState<Record<string, TokenRegistry.TokenInfo>>();

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
              message.success('Transaction Success');
              await hippoWallet?.refreshStores();
              setRefresh(true);
              if (callback) callback();
            }
          }
        }
      } catch (error) {
        console.log('request swap error:', error);
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
        setRefresh(false);
      }
    }
  }, [hippoWallet, refresh]);

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
        const result = await signAndSubmitTransaction(payload);
        if (result) {
          message.success('Transaction Success');
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

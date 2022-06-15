import { createContext, FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { hippoSwapClient, hippoWalletClient } from 'config/hippoWalletClient';
import { HippoSwapClient, HippoWalletClient, UITokenAmount, X0x1 } from '@manahippo/hippo-sdk';
import { TokenRegistry } from '@manahippo/hippo-sdk/dist/generated/X0x49c5e3ec5041062f02a352e4a2d03ce2bb820d94e8ca736b08a324f8dc634790';
import useAptosWallet from 'hooks/useAptosWallet';
import { aptosClient } from 'config/aptosClient';
import { message } from 'components/Antd';
import { TTransaction } from 'types/hippo';

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
    lhsUiAmt: number,
    rhsUiAmt: number,
    callback: () => void
  ) => {};
  requestWithdraw: (
    lhsSymbol: string,
    rhsSymbol: string,
    liqiudityAmt: UITokenAmount,
    lhsMinAmt: UITokenAmount,
    rhsMinAmt: UITokenAmount,
    callback: () => void
  ) => {};
  transaction?: TTransaction;
  setTransaction: (trans?: TTransaction) => void;
}

interface TProviderProps {
  children: ReactNode;
}

const HippoClientContext = createContext<HippoClientContextType>({} as HippoClientContextType);

const HippoClientProvider: FC<TProviderProps> = ({ children }) => {
  const { activeWallet } = useAptosWallet();
  const [hippoWallet, setHippoWallet] = useState<HippoWalletClient>();
  const [hippoSwap, setHippoSwapClient] = useState<HippoSwapClient>();
  const [refresh, setRefresh] = useState(false);
  const [transaction, setTransaction] = useState<TTransaction>();
  const [tokenStores, setTokenStores] = useState<Record<string, X0x1.Coin.CoinStore>>();
  const [tokenInfos, setTokenInfos] = useState<Record<string, TokenRegistry.TokenInfo>>();

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
        const payload = await hippoSwap.makeCPSwapPayload(
          fromSymbol,
          toSymbol,
          uiAmtIn,
          uiAmtOutMin
        );
        const swapTransaction = await aptosClient.generateTransaction(activeWallet, payload);
        setTransaction({ transaction: swapTransaction, callback });
      } catch (error) {
        console.log('request swap error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [hippoSwap, activeWallet]
  );

  const requestDeposit = useCallback(
    async (
      lhsSymbol: string,
      rhsSymbol: string,
      lhsUiAmt: number,
      rhsUiAmt: number,
      callback: () => void
    ) => {
      try {
        if (!activeWallet || !hippoSwap) {
          throw new Error('Please login first');
        }
        const payload = await hippoSwap.makeCPAddLiquidityPayload(
          lhsSymbol,
          rhsSymbol,
          lhsUiAmt,
          rhsUiAmt
        );
        const newTransaction = await aptosClient.generateTransaction(activeWallet, payload);
        setTransaction({ transaction: newTransaction, callback });
      } catch (error) {
        console.log('request deposit error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [hippoSwap, activeWallet]
  );

  const requestWithdraw = useCallback(
    async (
      lhsSymbol: string,
      rhsSymbol: string,
      liqiudityAmt: UITokenAmount,
      lhsMinAmt: UITokenAmount,
      rhsMinAmt: UITokenAmount,
      callback: () => void
    ) => {
      try {
        if (!activeWallet || !hippoSwap) {
          throw new Error('Please login first');
        }
        const payload = await hippoSwap?.makeCPRemoveLiquidityPayload(
          lhsSymbol,
          rhsSymbol,
          liqiudityAmt,
          lhsMinAmt,
          rhsMinAmt
        );
        const newTransaction = await aptosClient.generateTransaction(activeWallet, payload);
        setTransaction({ transaction: newTransaction, callback });
      } catch (error) {
        console.log('request withdraw error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [hippoSwap, activeWallet]
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
        setTransaction
      }}>
      {children}
    </HippoClientContext.Provider>
  );
};

export { HippoClientProvider, HippoClientContext };

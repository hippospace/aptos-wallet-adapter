import { createContext, FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { hippoSwapClient, hippoWalletClient } from 'config/hippoWalletClient';
import { HippoSwapClient, HippoWalletClient, UITokenAmount, X0x1 } from '@manahippo/hippo-sdk';
import { TokenRegistry } from '@manahippo/hippo-sdk/dist/generated/X0x49c5e3ec5041062f02a352e4a2d03ce2bb820d94e8ca736b08a324f8dc634790';
import useAptosWallet from 'hooks/useAptosWallet';
import { aptosClient, faucetClient } from 'config/aptosClient';
import { sendPayloadTx } from 'utils/hippoWalletUtil';
import { message } from 'components/Antd';
import { TTransaction } from 'types/hippo';

interface HippoClientContextType {
  hippoWallet?: HippoWalletClient;
  hippoSwap?: HippoSwapClient;
  tokenStores?: Record<string, X0x1.Coin.CoinStore>;
  tokenInfos?: Record<string, TokenRegistry.TokenInfo>;
  requestFaucet: (symbol: string, uiAmount: string) => {};
  requestSwap: (fromSymbol: string, toSymbol: string, uiAmtIn: number, uiAmtOutMin: number) => {};
  requestDeposit: (lhsSymbol: string, rhsSymbol: string, lhsUiAmt: number, rhsUiAmt: number) => {};
  requestWithdraw: (
    lhsSymbol: string,
    rhsSymbol: string,
    liqiudityAmt: UITokenAmount,
    lhsMinAmt: UITokenAmount,
    rhsMinAmt: UITokenAmount
  ) => {};
  transaction?: TTransaction;
  setTransaction: (trans: TTransaction) => void;
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
      const client = await hippoWalletClient(activeWallet.aptosAccount);
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
  }, [activeWallet, getHippoWalletClient]);

  useEffect(() => {
    if (hippoWallet) {
      setTokenStores(hippoWallet?.symbolToCoinStore);
      setTokenInfos(hippoWallet?.symbolToTokenInfo);
      if (refresh) {
        setRefresh(false);
      }
    }
  }, [hippoWallet, refresh]);

  const requestFaucet = useCallback(
    async (symbol: string) => {
      if (!activeWallet || !activeWallet.aptosAccount) throw new Error('Please login first');
      if (symbol === 'APTOS') {
        let result = await faucetClient.fundAccount(activeWallet.aptosAccount.address(), 100000);
        await hippoWallet?.refreshStores();
        setRefresh(true);
        console.log(result);
      } else {
        const uiAmtUsed = symbol === 'BTC' ? 0.01 : 10;
        const payload = await hippoWallet?.makeFaucetMintToPayload(uiAmtUsed, symbol);
        if (payload) {
          await sendPayloadTx(aptosClient, activeWallet.aptosAccount, payload);
          await hippoWallet?.refreshStores();
          setRefresh(true);
        }
      }
    },
    [activeWallet, hippoWallet]
  );

  const requestTransaction = useCallback(
    async (action: TTransaction) => {
      try {
        if (!activeWallet || !activeWallet.aptosAccount) throw new Error('Please login first');
        await sendPayloadTx(aptosClient, activeWallet.aptosAccount, action.payload);
        await hippoWallet?.refreshStores();
        setRefresh(true);
        message.success(`${action.type} successfully`);
        setTransaction({} as TTransaction);
      } catch (error) {
        throw error;
      }
    },
    [activeWallet, hippoWallet]
  );

  const requestSwap = useCallback(
    async (fromSymbol: string, toSymbol: string, uiAmtIn: number, uiAmtOutMin: number) => {
      try {
        if (!activeWallet || !activeWallet.aptosAccount || !hippoSwap)
          throw new Error('Please login first');
        if (uiAmtIn <= 0) {
          throw new Error('Input amount needs to be greater than 0');
        }
        const payload = await hippoSwap.makeCPSwapPayload(
          fromSymbol,
          toSymbol,
          uiAmtIn,
          uiAmtOutMin
        );
        const transactionInfo = { [fromSymbol]: uiAmtIn, [toSymbol]: uiAmtOutMin };
        if (payload) {
          setTransaction({ type: 'swap', payload, transactionInfo, callback: requestTransaction });
          // await sendPayloadTx(aptosClient, activeWallet.aptosAccount, payload);
          // await hippoWallet?.refreshStores();
          // setRefresh(true);
          // message.success('Swap successfully');
        }
      } catch (error) {
        console.log('request swap error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [hippoSwap, activeWallet, requestTransaction]
  );

  const requestDeposit = useCallback(
    async (lhsSymbol: string, rhsSymbol: string, lhsUiAmt: number, rhsUiAmt: number) => {
      try {
        if (!activeWallet || !activeWallet.aptosAccount || !hippoSwap) {
          throw new Error('Please login first');
        }
        const payload = await hippoSwap.makeCPAddLiquidityPayload(
          lhsSymbol,
          rhsSymbol,
          lhsUiAmt,
          rhsUiAmt
        );
        const transactionInfo = { [lhsSymbol]: lhsUiAmt, [rhsSymbol]: rhsUiAmt };
        if (payload) {
          setTransaction({
            type: 'deposit',
            payload,
            transactionInfo,
            callback: requestTransaction
          });
        }
      } catch (error) {
        console.log('request deposit error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [hippoSwap, activeWallet, requestTransaction]
  );

  const requestWithdraw = useCallback(
    async (
      lhsSymbol: string,
      rhsSymbol: string,
      liqiudityAmt: UITokenAmount,
      lhsMinAmt: UITokenAmount,
      rhsMinAmt: UITokenAmount
    ) => {
      try {
        if (!activeWallet || !activeWallet.aptosAccount || !hippoSwap) {
          throw new Error('Please login first');
        }
        const payload = await hippoSwap?.makeCPRemoveLiquidityPayload(
          lhsSymbol,
          rhsSymbol,
          liqiudityAmt,
          lhsMinAmt,
          rhsMinAmt
        );
        const transactionInfo = {
          [lhsSymbol]: lhsMinAmt,
          [rhsSymbol]: rhsMinAmt,
          'liquidity amount': liqiudityAmt
        };
        if (payload) {
          setTransaction({
            type: 'withdraw',
            payload,
            transactionInfo,
            callback: requestTransaction
          });
        }
      } catch (error) {
        console.log('request withdraw error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [hippoSwap, activeWallet, requestTransaction]
  );

  return (
    <HippoClientContext.Provider
      value={{
        hippoWallet,
        hippoSwap,
        tokenStores,
        tokenInfos,
        requestFaucet,
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

import { createContext, FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { hippoSwapClient, hippoWalletClient } from 'config/hippoWalletClient';
import { HippoSwapClient, HippoWalletClient, X0x1 } from '@manahippo/hippo-sdk';
import { TokenRegistry } from '@manahippo/hippo-sdk/dist/generated/X0x49c5e3ec5041062f02a352e4a2d03ce2bb820d94e8ca736b08a324f8dc634790';
import useAptosWallet from 'hooks/useAptosWallet';
import { aptosClient } from 'config/aptosClient';
import { sendPayloadTx } from 'utils/hippoWalletUtil';

interface HippoClientContextType {
  hippoWallet?: HippoWalletClient;
  tokenStores?: Record<string, X0x1.Coin.CoinStore>;
  tokenInfos?: Record<string, TokenRegistry.TokenInfo>;
  requestFaucet: (symbol: string, uiAmount: string) => {};
  requestSwap: (fromSymbol: string, toSymbol: string, uiAmtIn: string) => {};
}

interface TProviderProps {
  children: ReactNode;
}

const HippoClientContext = createContext<HippoClientContextType>({} as HippoClientContextType);

const HippoClientProvider: FC<TProviderProps> = ({ children }) => {
  const { activeWallet } = useAptosWallet();
  const [hippoWallet, setHippoWallet] = useState<HippoWalletClient>();
  const [swapClient, setHippoSwapClient] = useState<HippoSwapClient>();
  const [refresh, setRefresh] = useState(false);
  const [tokenStores, setTokenStores] = useState<Record<string, X0x1.Coin.CoinStore>>();
  const [tokenInfos, setTokenInfos] = useState<Record<string, TokenRegistry.TokenInfo>>();

  const getHippoWalletClient = useCallback(async () => {
    if (activeWallet) {
      const client = await hippoWalletClient(activeWallet.aptosAccount);
      const sClient = await hippoSwapClient();
      setHippoWallet(client);
      setHippoSwapClient(sClient);
    }
  }, [activeWallet]);

  useEffect(() => {
    getHippoWalletClient();
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
    async (symbol: string, uiAmount: string) => {
      if (!activeWallet || !activeWallet.aptosAccount) throw new Error('Please login first');
      const uiAmountNum = Number.parseFloat(uiAmount);
      if (uiAmountNum <= 0) {
        throw new Error('Input amount needs to be greater than 0');
      }
      const payload = await hippoWallet?.makeFaucetMintToPayload(uiAmountNum, symbol);
      if (payload) {
        await sendPayloadTx(aptosClient, activeWallet.aptosAccount, payload);
        await hippoWallet?.refreshStores();
        setRefresh(true);
      }
    },
    [activeWallet, hippoWallet]
  );

  const requestSwap = useCallback(
    async (fromSymbol: string, toSymbol: string, uiAmtIn: string) => {
      if (!activeWallet || !activeWallet.aptosAccount || !swapClient)
        throw new Error('Please login first');
      const uiAmtInNum = Number.parseFloat(uiAmtIn);
      if (uiAmtInNum <= 0) {
        throw new Error('Input amount needs to be greater than 0');
      }
      const payload = await swapClient.makeCPSwapPayload(fromSymbol, toSymbol, uiAmtInNum, 0);
      if (payload) {
        await sendPayloadTx(aptosClient, activeWallet.aptosAccount, payload);
        setRefresh(true);
      }
    },
    [swapClient, activeWallet]
  );

  return (
    <HippoClientContext.Provider
      value={{
        hippoWallet,
        tokenStores,
        tokenInfos,
        requestFaucet,
        requestSwap
      }}>
      {children}
    </HippoClientContext.Provider>
  );
};

export { HippoClientProvider, HippoClientContext };

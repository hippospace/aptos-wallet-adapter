/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TransactionPayload } from 'aptos/dist/api/data-contracts';
import { useLocalStorage } from 'hooks/useLocalStorage';
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletNotSelectedError
} from './errors';
import { PublicKey, WalletAdapter, WalletName, WalletReadyState } from './types/adapter';
import { Wallet, WalletContext } from './useWallet';

export interface WalletProviderProps {
  children: ReactNode;
  wallets: WalletAdapter[];
  autoConnect?: boolean;
  onError?: (error: any) => void;
  localStorageKey?: string;
}

const initialState: {
  wallet: Wallet | null;
  adapter: WalletAdapter | null;
  publicKey: PublicKey | null;
  connected: boolean;
} = {
  wallet: null,
  adapter: null,
  publicKey: null,
  connected: false
};

export const WalletProvider: FC<WalletProviderProps> = ({
  children,
  wallets: adapters,
  autoConnect = false,
  onError,
  localStorageKey = 'walletName'
}) => {
  const { useLocalStorageState } = useLocalStorage();
  const [name, setName] = useLocalStorageState<WalletName | null>(localStorageKey, null);
  const [{ wallet, adapter, publicKey, connected }, setState] = useState(initialState);
  const readyState = adapter?.readyState || WalletReadyState.Unsupported;
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const isConnecting = useRef(false);
  const isDisconnecting = useRef(false);
  const isUnloading = useRef(false);

  console.log('wallet provider::', wallet, adapter, publicKey, connected);
  // Wrap adapters to conform to the `Wallet` interface
  const [wallets, setWallets] = useState(() =>
    adapters.map((adpt) => ({
      adapter: adpt,
      readyState: adpt.readyState
    }))
  );

  // When the wallets change, start to listen for changes to their `readyState`
  useEffect(() => {
    function handleReadyStateChange(this: WalletAdapter, isReadyState: WalletReadyState) {
      setWallets((prevWallets) => {
        const walletIndex = prevWallets.findIndex(
          (wAdapter) => wAdapter.adapter.name === this.name
        );
        if (walletIndex === -1) return prevWallets;

        return [
          ...prevWallets.slice(0, walletIndex),
          { ...prevWallets[walletIndex], isReadyState },
          ...prevWallets.slice(walletIndex + 1)
        ];
      });
    }
    for (const wAdapter of adapters) {
      wAdapter.on('readyStateChange', handleReadyStateChange, wAdapter);
    }
    return () => {
      for (const wAdapter of adapters) {
        wAdapter.off('readyStateChange', handleReadyStateChange, wAdapter);
      }
    };
  }, [adapters]);

  // When the selected wallet changes, initialize the state
  // useEffect(() => {
  //   const selectedWallet = wallets.find((wAdapter) => wAdapter.adapter.name === name);
  //   console.log('MEMEME>>>', name, wallets, selectedWallet, adapter);
  //   if (selectedWallet) {
  //     setState({
  //       wallet: selectedWallet,
  //       adapter: selectedWallet.adapter,
  //       connected: selectedWallet.adapter.connected,
  //       publicKey: selectedWallet.adapter.publicKey
  //     });
  //   } else {
  //     setState(initialState);
  //   }
  // }, [name, wallets]);

  // Handle the adapter's connect event
  const handleConnect = useCallback(() => {
    if (!adapter) return;
    setState((state) => ({ ...state, connected: adapter.connected, publicKey: adapter.publicKey }));
  }, [adapter]);

  // Handle the adapter's disconnect event
  const handleDisconnect = useCallback(() => {
    // Clear the selected wallet unless the window is unloading
    if (!isUnloading.current) setName(null);
    setState(initialState);
  }, [isUnloading]);

  // Handle the adapter's error event, and local errors
  const handleError = useCallback(
    (error: WalletError) => {
      // Call onError unless the window is unloading
      if (!isUnloading.current) (onError || console.error)(error);
      return error;
    },
    [isUnloading, onError]
  );

  // Setup and teardown event listeners when the adapter changes
  useEffect(() => {
    if (adapter) {
      adapter.on('connect', handleConnect);
      adapter.on('disconnect', handleDisconnect);
      adapter.on('error', handleError);
      return () => {
        adapter.off('connect', handleConnect);
        adapter.off('disconnect', handleDisconnect);
        adapter.off('error', handleError);
      };
    }
  }, [adapter, handleConnect, handleDisconnect, handleError]);

  // When the adapter changes, disconnect the old one
  useEffect(() => {
    return () => {
      adapter?.disconnect();
    };
  }, [adapter]);

  // Connect the adapter to the wallet
  const connect = useCallback(
    async (walletName: string) => {
      if (isConnecting.current || connecting || disconnecting || connected) return;
      const selectedWallet = wallets.find((wAdapter) => wAdapter.adapter.name === walletName);
      let walletToConnect = initialState;
      // console.log('MEMEME>>>', name, wallets, selectedWallet, adapter);
      if (selectedWallet) {
        walletToConnect = {
          wallet: selectedWallet,
          adapter: selectedWallet.adapter,
          connected: selectedWallet.adapter.connected,
          publicKey: selectedWallet.adapter.publicKey
        };
      }
      setState(walletToConnect);
      if (!walletToConnect.adapter) throw handleError(new WalletNotSelectedError());

      if (
        !(
          walletToConnect.adapter.readyState === WalletReadyState.Installed ||
          walletToConnect.adapter.readyState === WalletReadyState.Loadable
        )
      ) {
        // Clear the selected wallet
        setName(null);

        if (typeof window !== 'undefined' && walletToConnect.adapter.url) {
          window.open(walletToConnect.adapter.url, '_blank');
        }

        throw handleError(new WalletNotReadyError());
      }

      isConnecting.current = true;
      setConnecting(true);
      try {
        await walletToConnect.adapter.connect();
      } catch (error: any) {
        // Clear the selected wallet
        setName(null);
        // Rethrow the error, and handleError will also be called
        throw error;
      } finally {
        setConnecting(false);
        isConnecting.current = false;
      }
    },
    [isConnecting, connecting, disconnecting, connected, readyState, handleError, wallets]
  );

  // Disconnect the adapter from the wallet
  const disconnect = useCallback(async () => {
    if (isDisconnecting.current || disconnecting) return;
    if (!adapter) return setName(null);

    isDisconnecting.current = true;
    setDisconnecting(true);
    try {
      await adapter.disconnect();
    } catch (error: any) {
      // Clear the selected wallet
      setName(null);
      // Rethrow the error, and handleError will also be called
      throw error;
    } finally {
      setDisconnecting(false);
      isDisconnecting.current = false;
    }
  }, [isDisconnecting, disconnecting, adapter]);

  // Send a transaction using the provided connection
  const signAndSubmitTransaction = useCallback(
    async (transaction: TransactionPayload) => {
      if (!adapter) throw handleError(new WalletNotSelectedError());
      if (!connected) throw handleError(new WalletNotConnectedError());
      console.log('sign and submit', adapter, transaction);
      const response = await adapter.signAndSubmitTransaction(transaction);
      console.log('sign and submit 2', response);
      return response;
    },
    [adapter, handleError, connected]
  );

  const signTransaction = useCallback(
    async (transaction: TransactionPayload) => {
      if (!adapter) throw handleError(new WalletNotSelectedError());
      if (!connected) throw handleError(new WalletNotConnectedError());
      return adapter.signTransaction(transaction);
    },
    [adapter, handleError, connected]
  );

  return (
    <WalletContext.Provider
      value={{
        autoConnect,
        wallets,
        wallet,
        publicKey,
        connected,
        connecting,
        disconnecting,
        select: setName,
        connect,
        disconnect,
        signAndSubmitTransaction,
        // sendTransaction,
        signTransaction
        // signAllTransactions,
        // signMessage
      }}>
      {children}
    </WalletContext.Provider>
  );
};

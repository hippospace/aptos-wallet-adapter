import { Types } from 'aptos';
import { createContext, useContext } from 'react';
import {
  AccountKeys,
  NetworkInfo,
  SignMessagePayload,
  SignMessageResponse,
  WalletAdapter,
  WalletName,
  WalletReadyState
} from '../WalletAdapters/BaseAdapter';

export interface Wallet {
  adapter: WalletAdapter;
  readyState: WalletReadyState;
}

export interface WalletContextState {
  autoConnect: boolean;
  wallets: Wallet[];
  wallet: Wallet | null;
  account: AccountKeys | null;
  connecting: boolean;
  connected: boolean;
  disconnecting: boolean;
  network: NetworkInfo;
  select(walletName?: WalletName): Promise<void>;
  connect(walletName?: WalletName): Promise<void>;
  disconnect(): Promise<void>;
  signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }>;
  signTransaction(transaction: Types.TransactionPayload, options?: any): Promise<Uint8Array>;
  signMessage(
    message: string | SignMessagePayload | Uint8Array
  ): Promise<SignMessageResponse | string>;
}

const DEFAULT_CONTEXT = {
  autoConnect: false,
  connecting: false,
  connected: false,
  disconnecting: false
} as WalletContextState;

export const WalletContext = createContext<WalletContextState>(
  DEFAULT_CONTEXT as WalletContextState
);

export function useWallet(): WalletContextState {
  return useContext(WalletContext);
}

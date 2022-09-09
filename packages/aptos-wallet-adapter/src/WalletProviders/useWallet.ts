import { TransactionPayload, HexEncodedBytes } from 'aptos/dist/generated';
import { createContext, useContext } from 'react';
import {
  AccountKeys,
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
  select(walletName: WalletName): void;
  connect(walletName: string): Promise<void>;
  disconnect(): Promise<void>;
  signAndSubmitTransaction(
    transaction: TransactionPayload,
    options?: any
  ): Promise<{ hash: HexEncodedBytes }>;
  signTransaction(transaction: TransactionPayload, options?: any): Promise<Uint8Array>;
  signMessage(message: string): Promise<string>;
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

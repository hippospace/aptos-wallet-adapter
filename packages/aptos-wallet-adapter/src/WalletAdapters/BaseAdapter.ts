import { MaybeHexString, Types } from 'aptos';
import EventEmitter from 'eventemitter3';

declare global {
  interface Window {
    hippo: any;
  }
}

export { EventEmitter };

export type PublicKey = MaybeHexString;
export type Address = MaybeHexString;
export type AuthKey = MaybeHexString;

export interface AccountKeys {
  publicKey: PublicKey | PublicKey[] | null;
  address: Address | null;
  authKey: AuthKey | null;
  minKeysRequired?: number;
}

export interface WalletAdapterEvents {
  connect(publicKey: PublicKey): void;
  disconnect(): void;
  error(error: any): void;
  success(value: any): void;
  readyStateChange(readyState: WalletReadyState): void;
  networkChange(network: WalletAdapterNetwork): void;
  accountChange(account: string): void;
}

export enum WalletReadyState {
  /**
   * User-installable wallets can typically be detected by scanning for an API
   * that they've injected into the global context. If such an API is present,
   * we consider the wallet to have been installed.
   */
  Installed = 'Installed',
  NotDetected = 'NotDetected',
  /**
   * Loadable wallets are always available to you. Since you can load them at
   * any time, it's meaningless to say that they have been detected.
   */
  Loadable = 'Loadable',
  /**
   * If a wallet is not supported on a given platform (eg. server-rendering, or
   * mobile) then it will stay in the `Unsupported` state.
   */
  Unsupported = 'Unsupported'
}

export type WalletName<T extends string = string> = T & { __brand__: 'WalletName' };

export type NetworkInfo = {
  api?: string;
  chainId?: string;
  name: WalletAdapterNetwork | undefined;
};

export enum WalletAdapterNetwork {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
  Devnet = 'devnet'
}

export interface WalletAdapterProps<Name extends string = string> {
  name: WalletName<Name>;
  url: string;
  icon: string;
  readyState: WalletReadyState;
  connecting: boolean;
  connected: boolean;
  publicAccount: AccountKeys;
  network: NetworkInfo;
  onAccountChange(): Promise<void>;
  onNetworkChange(): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }>;
  signTransaction(transaction: Types.TransactionPayload, options?: any): Promise<Uint8Array>;
  signMessage(
    message: string | SignMessagePayload | Uint8Array
  ): Promise<string | SignMessageResponse>;
}

export type WalletAdapter<Name extends string = string> = WalletAdapterProps<Name> &
  EventEmitter<WalletAdapterEvents>;

export interface SignMessagePayload {
  address?: boolean; // Should we include the address of the account in the message
  application?: boolean; // Should we include the domain of the dapp
  chainId?: boolean; // Should we include the current chain id the wallet is connected to
  message: string; // The message to be signed and displayed to the user
  nonce: string; // A nonce the dapp should generate
}

export interface SignMessageResponse {
  address: string;
  application: string;
  chainId: number;
  fullMessage: string; // The message that was generated to sign
  message: string; // The message passed in by the user
  nonce: string;
  prefix: string; // Should always be APTOS
  signature: string; // The signed full message
}

export abstract class BaseWalletAdapter
  extends EventEmitter<WalletAdapterEvents>
  implements WalletAdapter
{
  abstract name: WalletName;

  abstract url: string;

  abstract icon: string;

  abstract get readyState(): WalletReadyState;

  abstract get publicAccount(): AccountKeys;

  abstract get network(): NetworkInfo;

  abstract get connecting(): boolean;

  get connected(): boolean {
    return !!this.publicAccount.publicKey;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract signAndSubmitTransaction(
    transaction: Types.TransactionPayload
  ): Promise<{ hash: Types.HexEncodedBytes }>;

  abstract signTransaction(transaction: Types.TransactionPayload): Promise<Uint8Array>;

  abstract signMessage(
    message: string | SignMessagePayload | Uint8Array
  ): Promise<string | SignMessageResponse>;

  abstract onAccountChange(): Promise<void>;
  abstract onNetworkChange(): Promise<void>;
}

export function scopePollingDetectionStrategy(detect: () => boolean): void {
  // Early return when server-side rendering
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const disposers: (() => void)[] = [];

  function detectAndDispose() {
    const detected = detect();
    if (detected) {
      for (const dispose of disposers) {
        dispose();
      }
    }
  }

  // Strategy #1: Try detecting every second.
  const interval =
    // TODO: #334 Replace with idle callback strategy.
    setInterval(detectAndDispose, 1000);
  disposers.push(() => clearInterval(interval));

  // Strategy #2: Detect as soon as the DOM becomes 'ready'/'interactive'.
  if (
    // Implies that `DOMContentLoaded` has not yet fired.
    document.readyState === 'loading'
  ) {
    document.addEventListener('DOMContentLoaded', detectAndDispose, { once: true });
    disposers.push(() => document.removeEventListener('DOMContentLoaded', detectAndDispose));
  }

  // Strategy #3: Detect after the `window` has fully loaded.
  if (
    // If the `complete` state has been reached, we're too late.
    document.readyState !== 'complete'
  ) {
    window.addEventListener('load', detectAndDispose, { once: true });
    disposers.push(() => window.removeEventListener('load', detectAndDispose));
  }

  // Strategy #4: Detect synchronously, now.
  detectAndDispose();
}

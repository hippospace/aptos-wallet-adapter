/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/brace-style */
import { HexString, MaybeHexString } from 'aptos';
import {
  PendingTransaction,
  SubmitTransactionRequest,
  TransactionPayload
} from 'aptos/dist/api/data-contracts';
import EventEmitter from 'eventemitter3';

declare global {
  interface Window {
    hippo: any;
  }
}

export { EventEmitter };

export type PublicKey = MaybeHexString;

export interface WalletAdapterEvents {
  connect(publicKey: PublicKey): void;
  disconnect(): void;
  error(error: any): void;
  readyStateChange(readyState: WalletReadyState): void;
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

export interface WalletAdapterProps<Name extends string = string> {
  name: WalletName<Name>;
  url: string;
  icon: string;
  readyState: WalletReadyState;
  publicKey: PublicKey | null;
  connecting: boolean;
  connected: boolean;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signAndSubmitTransaction(
    transaction: TransactionPayload
    // connection: Connection,
    // options?: SendTransactionOptions
  ): Promise<PendingTransaction>;
  signTransaction(
    transaction: TransactionPayload
    // connection: Connection,
    // options?: SendTransactionOptions
  ): Promise<SubmitTransactionRequest>;
}

export type WalletAdapter<Name extends string = string> = WalletAdapterProps<Name> &
  EventEmitter<WalletAdapterEvents>;

export interface SignerWalletAdapterProps {
  // signTransaction(transaction: Transaction): Promise<Transaction>;
  // signAllTransactions(transaction: Transaction[]): Promise<Transaction[]>;
}

export abstract class BaseWalletAdapter
  extends EventEmitter<WalletAdapterEvents>
  implements WalletAdapter
{
  abstract name: WalletName;

  abstract url: string;

  abstract icon: string;

  abstract get readyState(): WalletReadyState;

  abstract get publicKey(): PublicKey | null;

  abstract get connecting(): boolean;

  get connected(): boolean {
    return !!this.publicKey;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract signAndSubmitTransaction(transaction: TransactionPayload): Promise<PendingTransaction>;

  abstract signTransaction(transaction: TransactionPayload): Promise<SubmitTransactionRequest>;
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

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PendingTransaction,
  SubmitTransactionRequest,
  TransactionPayload
} from 'aptos/dist/api/data-contracts';
import {
  WalletConfigError,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletDisconnectionError,
  WalletError,
  WalletLoadError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletSignTransactionError,
  WalletTimeoutError,
  WalletWindowBlockedError,
  WalletWindowClosedError
} from '../errors';
import {
  BaseWalletAdapter,
  PublicKey,
  scopePollingDetectionStrategy,
  // WalletAdapter,
  WalletName,
  WalletReadyState
} from '../types/adapter';

interface IHippoWallet {
  connect: () => Promise<{ address: string }>;
  account: () => Promise<string>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction(transaction: any): Promise<void>;
  signTransaction(transaction: any): Promise<void>;
  disconnect(): Promise<void>;
}

interface HippoWindow extends Window {
  hippoWallet?: IHippoWallet;
}

declare const window: HippoWindow;

export const HippoWalletName = 'Hippo Extension Wallet' as WalletName<'Hippo Extension Wallet'>;

export interface HippoWalletAdapterConfig {
  provider?: IHippoWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class HippoExtensionWalletAdapter extends BaseWalletAdapter {
  name = HippoWalletName;

  url = 'https://hippo-wallet-test.web.app';

  icon = 'https://ui-test1-22e7c.web.app/static/media/hippo_logo.ecded6bf411652de9b7f.png';

  protected _provider: IHippoWallet | undefined;

  // protected _network: WalletAdapterNetwork;
  protected _timeout: number;

  protected _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  protected _connecting: boolean;

  protected _wallet: any | null;

  constructor({
    // provider,
    // network = WalletAdapterNetwork.Mainnet,
    timeout = 10000
  }: HippoWalletAdapterConfig = {}) {
    super();

    this._provider = window.hippoWallet;
    // this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.hippoWallet) {
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
          return true;
        }
        return false;
      });
    }
  }

  get publicKey(): PublicKey | null {
    return this._wallet?.publicKey || null;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return !!this._wallet?.isConnected;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (
        !(
          this._readyState === WalletReadyState.Loadable ||
          this._readyState === WalletReadyState.Installed
        )
      )
        throw new WalletNotReadyError();
      this._connecting = true;

      const provider = this._provider || window.hippoWallet;
      const response = await provider?.connect();

      this._wallet = {
        publicKey: response?.address,
        isConnected: true
      };

      this.emit('connect', this._wallet.publicKey);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;
    if (wallet) {
      this._wallet = null;

      try {
        const provider = this._provider || window.hippoWallet;
        await provider?.disconnect();
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit('disconnect');
  }

  async signTransaction(transaction: TransactionPayload): Promise<SubmitTransactionRequest> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const provider = this._provider || window.hippoWallet;
        const response = await provider?.signTransaction(transaction);
        if (response) {
          return response;
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signAndSubmitTransaction(transaction: TransactionPayload): Promise<PendingTransaction> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const provider = this._provider || window.hippoWallet;
        const response = await provider?.signAndSubmitTransaction(transaction);
        if (response) {
          return response;
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error: any) {
        throw new WalletSignTransactionError(error.message);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }
}

import {
  HexEncodedBytes,
  SubmitTransactionRequest,
  TransactionPayload
} from 'aptos/dist/generated';
import {
  WalletDisconnectionError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSignTransactionError
} from '../WalletProviders/errors';
import {
  AccountKeys,
  BaseWalletAdapter,
  scopePollingDetectionStrategy,
  WalletName,
  WalletReadyState
} from './BaseAdapter';

interface IAptosWallet {
  connect: () => Promise<{ address: string }>;
  account: () => Promise<string>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction(transaction: any): Promise<{ hash: HexEncodedBytes }>;
  signTransaction(transaction: any): Promise<SubmitTransactionRequest>;
  disconnect(): Promise<void>;
}

interface AptosWindow extends Window {
  aptos?: IAptosWallet;
}

declare const window: AptosWindow;

export const AptosWalletName = 'Aptos Wallet' as WalletName<'Aptos Wallet'>;

export interface AptosWalletAdapterConfig {
  provider?: IAptosWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class AptosWalletAdapter extends BaseWalletAdapter {
  name = AptosWalletName;

  url = 'https://aptos.dev/guides/building-wallet-extension';

  icon = 'https://miro.medium.com/fit/c/176/176/1*Gf747eyRywU8Img0tK5wvw.png';

  protected _provider: IAptosWallet | undefined;

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
  }: AptosWalletAdapterConfig = {}) {
    super();

    this._provider = typeof window !== 'undefined' ? window.aptos : undefined;
    // this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.aptos) {
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
          return true;
        }
        return false;
      });
    }
  }

  get publicAccount(): AccountKeys {
    return {
      publicKey: this._wallet?.publicKey || null,
      address: this._wallet?.address || null,
      authKey: this._wallet?.authKey || null
    };
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

      const provider = this._provider || window.aptos;
      const isConnected = await this._provider?.isConnected();
      if (isConnected === true) {
        await provider?.disconnect();
      }

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
        const provider = this._provider || window.aptos;
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
      const provider = this._provider || window.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();

      const response = await provider?.signTransaction(transaction);
      if (response) {
        return response;
      } else {
        throw new Error('Sign Transaction failed');
      }
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignTransactionError(errMsg));
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: TransactionPayload
  ): Promise<{ hash: HexEncodedBytes }> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();

      const response = await provider?.signAndSubmitTransaction(transaction);
      if (response) {
        return response;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignTransactionError(errMsg));
      throw error;
    }
  }
}

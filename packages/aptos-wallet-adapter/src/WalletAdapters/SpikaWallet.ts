import { HexEncodedBytes, TransactionPayload } from 'aptos/src/generated';
import {
  WalletDisconnectionError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSignAndSubmitMessageError,
  WalletSignMessageError,
  WalletSignTransactionError
} from '../WalletProviders/errors';
import {
  AccountKeys,
  BaseWalletAdapter,
  scopePollingDetectionStrategy,
  WalletName,
  WalletReadyState
} from './BaseAdapter';

interface ISpikaWallet {
  connect: () => Promise<{ publicKey: string; account: string; authKey: string }>;
  account: () => Promise<string>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction(transaction: any, options?: any): Promise<{ hash: HexEncodedBytes }>;
  signTransaction(transaction: any, options?: any): Promise<Uint8Array>;
  signMessage(message: string): Promise<string>;
  disconnect(): Promise<void>;
}

interface SpikaWindow extends Window {
  spika?: ISpikaWallet;
}

declare const window: SpikaWindow;

export const SpikaWalletName = 'Spika' as WalletName<'Spika'>;

export interface SpikaWalletAdapterConfig {
  provider?: ISpikaWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class SpikaWalletAdapter extends BaseWalletAdapter {
  name = SpikaWalletName;

  url = 'https://chrome.google.com/webstore/detail/spika/fadkojdgchhfkdkklllhcphknohbmjmb';

  icon = 'https://spika.app/assets/logo_400_nb.png';

  protected _provider: ISpikaWallet | undefined;

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
  }: SpikaWalletAdapterConfig = {}) {
    super();

    this._provider = typeof window !== 'undefined' ? window.spika : undefined;
    // this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.spika) {
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
      publicKeys: this._wallet?.publicKeys || null,
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
      if (this.connected || this.connecting) {
        return;
      }

      if (
        !(
          this._readyState === WalletReadyState.Loadable ||
          this._readyState === WalletReadyState.Installed
        )
      )
        throw new WalletNotReadyError();
      this._connecting = true;

      const provider = this._provider || window.spika;
      await provider?.isConnected();
      // const isConnected = await provider?.isConnected();
      // if (isConnected === true) {
      //   await provider?.disconnect();
      // }

      const response = await provider?.connect();
      if (response?.publicKey !== undefined) {
        this._wallet = {
          publicKeys: response?.publicKey ? [response.publicKey] : null,
          address: response?.account,
          authKey: response?.authKey,
          isConnected: true
        };
      } else {
        this._wallet = {
          isConnected: false
        };
      }

      this.emit('connect', this._wallet.publicKeys);
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
        const provider = this._provider || window.spika;
        await provider?.disconnect();
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit('disconnect');
  }

  async signTransaction(transaction: TransactionPayload, options?: any): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.spika;
      if (!wallet || !provider) throw new WalletNotConnectedError();

      const response = await provider?.signTransaction(transaction, options);
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
    transaction: TransactionPayload,
    options?: any
  ): Promise<{ hash: HexEncodedBytes }> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.spika;
      if (!wallet || !provider) throw new WalletNotConnectedError();

      const response = await provider?.signAndSubmitTransaction(transaction, options);
      if (response) {
        return response;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignAndSubmitMessageError(errMsg));
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.spika;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const response = await provider?.signMessage(message);
      if (response) {
        return response;
      } else {
        throw new Error('Sign Message failed');
      }
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignMessageError(errMsg));
      throw error;
    }
  }
}

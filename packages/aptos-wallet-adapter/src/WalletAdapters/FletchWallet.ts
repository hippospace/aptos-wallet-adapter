import { Types } from 'aptos';
import {
  WalletAccountChangeError,
  WalletDisconnectionError,
  WalletNetworkChangeError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSignAndSubmitMessageError,
  WalletSignMessageError,
  WalletSignTransactionError
} from '../WalletProviders/errors';
import {
  AccountKeys,
  BaseWalletAdapter,
  NetworkInfo,
  scopePollingDetectionStrategy,
  SignMessagePayload,
  SignMessageResponse,
  WalletAdapterNetwork,
  WalletName,
  WalletReadyState
} from './BaseAdapter';

interface IFletchWallet {
  connect: () => Promise<{ Address: string; PublicKey: string; code: number; error?: any }>;
  account: () => Promise<string>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction(transaction: any): Promise<{ code: number; error?: any; hash: string }>;
  signTransaction(payload: any): Promise<{ code: number; error?: any; tx: Uint8Array }>;
  signMessage(
    message: SignMessagePayload
  ): Promise<{ code: number; error?: any; signedMessage: SignMessageResponse }>;
  disconnect(): Promise<void>;
}

interface AptosWindow extends Window {
  fletch?: IFletchWallet;
}

declare const window: AptosWindow;

export const FletchWalletName = 'Fletch' as WalletName<'Fletch'>;

export interface FletchWalletAdapterConfig {
  provider?: IFletchWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class FletchWalletAdapter extends BaseWalletAdapter {
  name = FletchWalletName;

  url = 'http://fletchwallet.io';

  icon = 'http://fletchwallet.io/img/fletch-white.svg';

  protected _provider: IFletchWallet;

  protected _network: WalletAdapterNetwork;

  protected _chainId: string;

  protected _api: string;

  protected _timeout: number;

  protected _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  protected _connecting: boolean;

  protected _wallet: any | null;

  constructor({
    // provider,
    // network = WalletAdapterNetwork.Testnet,
    timeout = 10000
  }: FletchWalletAdapterConfig = {}) {
    super();

    this._provider = typeof window !== 'undefined' ? window.fletch : undefined;
    this._network = undefined;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.fletch) {
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

  get network(): NetworkInfo {
    return {
      name: this._network,
      api: this._api,
      chainId: this._chainId
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

      const provider = this._provider || window.fletch;
      const isConnected = await this._provider?.isConnected();
      if (isConnected === true) {
        await provider?.disconnect();
      }

      const response = await provider?.connect();
      if (response.code != 200) {
        throw response.error;
      }
      this._wallet = {
        address: response?.Address,
        publicKey: response?.PublicKey,
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
    const provider = this._provider || window.fletch;
    if (wallet) {
      this._wallet = null;

      try {
        await provider?.disconnect();
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit('disconnect');
  }

  async signTransaction(transaction: Types.TransactionPayload): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.fletch;
      if (!wallet || !provider) throw new WalletNotConnectedError();

      const response = await provider.signTransaction(transaction);
      if (response.code != 200) {
        throw response.error;
      }
      return response.tx;
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignTransactionError(errMsg));
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.fletch;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const response = await provider.signAndSubmitTransaction(transaction);
      if (response.code == 200) {
        return { hash: response.hash };
      }

      throw response.error;
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignAndSubmitMessageError(errMsg));
      throw error;
    }
  }

  async signMessage(msgPayload: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.fletch;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      if (typeof msgPayload !== 'object' || !msgPayload.nonce) {
        throw new WalletSignMessageError('Invalid signMessage Payload');
      }

      const response = await provider?.signMessage(msgPayload);
      if (response.code == 200) {
        return response.signedMessage;
      }

      throw response.error;
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignMessageError(errMsg));
      throw error;
    }
  }

  async onAccountChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.fletch;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      //To be implemented
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletAccountChangeError(errMsg));
      throw error;
    }
  }

  async onNetworkChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.fletch;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      //To be implemented
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }
}

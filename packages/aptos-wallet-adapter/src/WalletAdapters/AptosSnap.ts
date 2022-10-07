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
  scopePollingDetectionStrategy,
  WalletName,
  WalletReadyState,
  SignMessagePayload,
  SignMessageResponse,
  NetworkInfo,
  WalletAdapterNetwork
} from './BaseAdapter';
import { PublicAccount } from '@keystonehq/aptossnap-adapter/build/types';
import WalletAdapter from '@keystonehq/aptossnap-adapter';

interface IAptosSnap {
  connect: () => Promise<PublicAccount>;
  account: () => Promise<PublicAccount>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction(
    transaction: Types.EntryFunctionPayload,
    options?: any
  ): Promise<Types.PendingTransaction>;
  signMessage(message: SignMessagePayload): Promise<SignMessageResponse>;
  disconnect(): Promise<void>;
  signTransaction(transaction: Types.EntryFunctionPayload): Promise<Uint8Array>;
}

interface SnapWindow extends Window {
  snap?: IAptosSnap;
}

declare const window: SnapWindow;

export const AptosSnapName = 'Snap' as WalletName<'Snap'>;

export interface AptosSnapAdapterConfig {
  provider?: IAptosSnap;
  network: WalletAdapterNetwork;
  timeout?: number;
}

export class AptosSnapAdapter extends BaseWalletAdapter {
  name = AptosSnapName;

  url =
    'https://chrome.google.com/webstore/detail/metamask-flask-developmen/ljfoeinjpaedjfecbmggjgodbgkmjkjk';

  icon = 'https://metamask.zendesk.com/hc/article_attachments/6974707389467/mceclip1.png';

  protected _provider: IAptosSnap | undefined;

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

  constructor(
    {
      // provider,
      network,
      timeout = 10000
    }: AptosSnapAdapterConfig = { network: WalletAdapterNetwork.Devnet }
  ) {
    super();
    //@ts-ignore
    this._provider = new WalletAdapter({ network }, 'npm:@keystonehq/aptossnap');
    this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;
    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.ethereum) {
          this._readyState = WalletReadyState.Installed;
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
      const provider = this._provider;
      const isConnected = await provider?.isConnected();
      if (isConnected) {
        await provider?.disconnect();
      }
      const response = await provider?.connect();
      this._wallet = {
        ...response,
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
    const provider = this._provider;
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
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const provider = this._provider;
        const response = await provider?.signTransaction(transaction as Types.EntryFunctionPayload);
        if (response) {
          return new Uint8Array([]);
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

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const provider = this._provider;
        const response = await provider?.signAndSubmitTransaction(
          transaction as Types.EntryFunctionPayload,
          options
        );
        if (response) {
          return { hash: response.hash };
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error: any) {
        // console.log('transact err', error, error.message);
        throw new WalletSignAndSubmitMessageError(error.message || error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const wallet = this._wallet;
      const provider = this._provider;
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

  async onAccountChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider;
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
      const provider = this._provider;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      //To be implemented
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }
}

import {
  WalletAccountChangeError,
  WalletConnectionError,
  WalletDisconnectionError,
  WalletGetNetworkError,
  WalletNetworkChangeError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSignAndSubmitMessageError,
  WalletSignMessageError,
  WalletSignTransactionError
} from '../WalletProviders/errors';
import Web3, { Web3ProviderType } from '@fewcha/web3';
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
import { Types } from 'aptos';

export const FewchaWalletName = 'Fewcha' as WalletName<'Fewcha'>;

interface FewchaWindow extends Window {
  fewcha: Web3ProviderType;
}

declare const window: FewchaWindow;

export interface FewchaAdapterConfig {
  provider?: string;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class FewchaWalletAdapter extends BaseWalletAdapter {
  name = FewchaWalletName;

  url = 'https://fewcha.app/';

  icon = 'https://miro.medium.com/fit/c/176/176/1*a0WaY-q7gjCRiuryRG6TkQ.png';

  protected _provider: Web3ProviderType | undefined;

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
    // provider = WEBWALLET_URL,
    // network = WalletAdapterNetwork.Testnet,
    timeout = 10000
  }: FewchaAdapterConfig = {}) {
    super();

    this._network = undefined;
    this._provider = typeof window !== 'undefined' ? new Web3().action : undefined;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;
    // this._readyState = WalletReadyState.Installed;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.fewcha) {
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
    return !!this._wallet?.connected;
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
      const provider = this._provider || window.fewcha;
      const isConnected = await provider.isConnected();
      if (isConnected?.data === true) {
        await provider.disconnect();
      }
      const response = await provider.connect();
      if (response.status === 401) {
        throw new WalletConnectionError('User has rejected the connection');
      } else if (response.status !== 200) {
        throw new WalletConnectionError('Wallet connect issue');
      }
      let accountDetail = { ...response.data };

      if (!accountDetail.publicKey) {
        const accountResp = await provider.account();
        if (!accountResp.data.publicKey) {
          throw new WalletConnectionError('Wallet connect issue', response.data);
        }
        accountDetail = { ...accountResp.data };
      }
      this._wallet = {
        connected: true,
        ...accountDetail
      };
      try {
        const { data: name } = await provider?.getNetwork();
        const chainId = null;
        const api = null;

        this._network = name as WalletAdapterNetwork;
        this._chainId = chainId;
        this._api = api;
      } catch (error: any) {
        const errMsg = error.message;
        this.emit('error', new WalletGetNetworkError(errMsg));
        throw error;
      }
      this.emit('connect', this._wallet.publicKey);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const provider = this._provider || window.fewcha;
    if (provider) {
      try {
        const isDisconnected = await provider.disconnect();
        if (isDisconnected.data === true) {
          this._provider = undefined;
          this._wallet = null;
        } else {
          throw new Error('Disconnect failed');
        }
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
        throw error;
      }
    }
    this.emit('disconnect');
  }

  async signTransaction(transaction: Types.TransactionPayload, options?: any): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      const provider = this._provider || window.fewcha;
      const tx = await provider.generateTransaction(
        transaction as Types.EntryFunctionPayload,
        options
      );
      if (!tx) throw new Error('Cannot generate transaction');
      const response = await provider?.signTransaction(tx.data);

      if (!response || response.status !== 200) {
        throw new Error('No response');
      }
      return response.data;
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : error.response.data.message;
      this.emit('error', new WalletSignTransactionError(errMsg));
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

      const provider = this._provider || window.fewcha;
      const tx = await provider.generateTransaction(
        transaction as Types.EntryFunctionPayload,
        options
      );
      if (!tx) throw new Error('Cannot generate transaction');
      const response = await provider?.signAndSubmitTransaction(tx.data);
      if (response.status === 401) {
        throw new Error('User has rejected the transaction');
      } else if (response.status !== 200) {
        throw new Error('Transaction issue');
      }
      return {
        hash: response.data
      };
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : error.response.data.message;
      this.emit('error', new WalletSignAndSubmitMessageError(errMsg));
      throw error;
    }
  }

  async signMessage(msgPayload: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.fewcha;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const response = await provider?.signMessage(msgPayload);
      if (response) {
        return response.data;
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
      const provider = this._provider || window.fewcha;
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
      const provider = this._provider || window.fewcha;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      //To be implemented
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }
}

import { Types } from 'aptos';
import {
  WalletAccountChangeError,
  WalletDisconnectionError,
  WalletGetNetworkError,
  WalletNetworkChangeError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSignAndSubmitMessageError,
  WalletSignMessageError,
  WalletSignTransactionError
} from '@manahippo/aptos-wallet-adapter';
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
} from '@manahippo/aptos-wallet-adapter';

interface IApotsErrorResult {
  code: number;
  message: string;
}

type AddressInfo = { address: string; publicKey: string };

interface IConnectOptions {
  network: string;
}

interface ICoin98Wallet {
  connect: (options?: IConnectOptions) => Promise<AddressInfo>;
  account: () => Promise<AddressInfo>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction(
    transaction: any,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes } | IApotsErrorResult>;
  signTransaction(transaction: any, options?: any): Promise<Uint8Array | IApotsErrorResult>;
  signMessage(message: SignMessagePayload): Promise<SignMessageResponse>;
  disconnect(): Promise<void>;
  on: (eventName: string, callback: Function) => void;
}

interface AptosWindow extends Window {
  coin98?: {
    aptos: ICoin98Wallet;
  };
}

declare const window: AptosWindow;

export const Coin98WalletName = 'Coin98' as WalletName<'Coin98'>;

export interface Coin98WalletAdapterConfig {
  provider?: ICoin98Wallet;
  network?: WalletAdapterNetwork;
  timeout?: number;
}

export class Coin98WalletAdapter extends BaseWalletAdapter {
  name = Coin98WalletName;

  url = 'https://chrome.google.com/webstore/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg';

  icon = 'https://coin98.s3.ap-southeast-1.amazonaws.com/Coin/c98wallet.png';

  protected _provider: ICoin98Wallet | undefined;

  protected _network: WalletAdapterNetwork | undefined;

  protected _chainId: string | undefined;

  protected _api: string | undefined;

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
  }: Coin98WalletAdapterConfig = {}) {
    super();

    this._provider = typeof window !== 'undefined' ? window.coin98?.aptos : undefined;
    this._network = undefined;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.coin98?.aptos) {
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

      const provider = this._provider || window.coin98?.aptos;
      let response = await provider?.connect({ network: this._network || 'mainnet' });

      if (typeof response === 'boolean') {
        response = await provider?.account();
      }

      this._wallet = {
        address: response?.address,
        publicKey: response?.publicKey,
        isConnected: true
      };

      try {
        const chainId = undefined;
        const api = undefined;

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
    const wallet = this._wallet;
    const provider = this._provider || window.coin98?.aptos;
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

  async signTransaction(transaction: Types.TransactionPayload, options?: any): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.coin98?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();

      const response = await provider.signTransaction(transaction, options);
      if ((response as IApotsErrorResult).code) {
        throw new Error((response as IApotsErrorResult).message);
      }
      return response as Uint8Array;
    } catch (error: any) {
      const errMsg = error.message;
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
      const provider = this._provider || window.coin98?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();

      const response = await provider.signAndSubmitTransaction(transaction, options);
      if ((response as IApotsErrorResult).code) {
        throw new Error((response as IApotsErrorResult).message);
      }
      return response as { hash: Types.HexEncodedBytes };
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignAndSubmitMessageError(errMsg));
      throw error;
    }
  }

  async signMessage(msgPayload: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.coin98?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      if (typeof msgPayload !== 'object' || !msgPayload.nonce) {
        throw new WalletSignMessageError('Invalid signMessage Payload');
      }
      const response = await provider?.signMessage(msgPayload);
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
      const provider = this._provider || window.coin98?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const handleAccountChange = async (newAccount: AddressInfo) => {
        if (newAccount?.publicKey) {
          this._wallet = {
            ...this._wallet,
            publicKey: newAccount.publicKey || this._wallet?.publicKey,
            address: newAccount.address || this._wallet?.address
          };
        } else {
          const response = await provider?.connect();
          this._wallet = {
            ...this._wallet,
            address: response?.address || this._wallet?.address,
            publicKey: response?.publicKey || this._wallet?.publicKey
          };
        }
        this.emit('accountChange', newAccount.publicKey);
      };

      provider.on('accountChange', handleAccountChange);
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletAccountChangeError(errMsg));
      throw error;
    }
  }

  async onNetworkChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.coin98?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      //To be implemented
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }
}

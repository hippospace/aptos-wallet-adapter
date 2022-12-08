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

type AddressInfo = { address: string; publicKey: string; authKey?: string };

interface IOpenBlockWallet {
  connect: () => Promise<AddressInfo>;
  account: () => Promise<AddressInfo>;
  network: () => Promise<NetworkInfo>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction(transaction: any): Promise<{ hash: string }>;
  signTransaction(payload: any): Promise<string>;
  signMessage(message: SignMessagePayload): Promise<SignMessageResponse>;
  disconnect(): Promise<void>;
  onAccountChange: (listener: (newAddress: AddressInfo) => void) => void;
  onNetworkChange: (listener: (network: NetworkInfo) => void) => void;
}

interface OpenBlockWindow extends Window {
  openblock?: {
    aptos?: IOpenBlockWallet;
  };
}

declare const window: OpenBlockWindow;

export const OpenBlockWalletName = 'OpenBlock' as WalletName<'OpenBlock'>;

export interface OpenBlockWalletAdapterConfig {
  provider?: IOpenBlockWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class OpenBlockWalletAdapter extends BaseWalletAdapter {
  name = OpenBlockWalletName;

  url = 'https://openblock.com/';

  icon = 'https://obstatic.243096.com/download/dapp/sdk/images/logo_blue.svg';

  protected _provider: IOpenBlockWallet;

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
  }: OpenBlockWalletAdapterConfig = {}) {
    super();

    this._provider = typeof window !== 'undefined' ? window.openblock?.aptos : undefined;
    this._network = undefined;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      require('@openblockhq/dappsdk');
      scopePollingDetectionStrategy(() => {
        if (window.openblock?.aptos) {
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

      const provider = this._provider || window?.openblock?.aptos;
      const isConnected = await this._provider?.isConnected();
      if (isConnected === true) {
        await provider?.disconnect();
      }

      const response = await provider?.connect();
      if (response.address) {
        this._wallet = {
          address: response?.address,
          publicKey: response?.publicKey,
          isConnected: true
        };
        const network = await provider?.network();

        this._network = network.name;
        this._chainId = network.chainId;
        this._api = network.api;
      } else {
        throw new Error('failed to connect');
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
    const provider = this._provider || window?.openblock?.aptos;
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
      const provider = this._provider || window?.openblock?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();

      const response = await provider.signTransaction(transaction);
      if (response) {
        return new TextEncoder().encode(response);
      }
      throw new Error('failed to SignTransaction');
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
      const provider = this._provider || window?.openblock?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const response = await provider.signAndSubmitTransaction(transaction);
      if (response) {
        return response;
      }
      throw new Error('Failed to SignAndSubmitTransaction');
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignAndSubmitMessageError(errMsg));
      throw error;
    }
  }

  async signMessage(msgPayload: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window?.openblock?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      if (typeof msgPayload !== 'object' || !msgPayload.nonce) {
        throw new WalletSignMessageError('Invalid signMessage Payload');
      }

      const response = await provider?.signMessage(msgPayload);
      if (response) {
        return response;
      }

      throw new Error('Failed to signMessage');
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignMessageError(errMsg));
      throw error;
    }
  }

  async onAccountChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window?.openblock?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const handleAccountChange = async (newAccount: AddressInfo) => {
        this._wallet = {
          ...this._wallet,
          publicKey: newAccount.publicKey || this._wallet?.publicKey,
          authKey: newAccount.authKey || this._wallet?.authKey,
          address: newAccount.address || this._wallet?.address
        };
        this.emit('accountChange', newAccount.publicKey);
      };
      provider?.onAccountChange(handleAccountChange);
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletAccountChangeError(errMsg));
      throw error;
    }
  }

  async onNetworkChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window?.openblock?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const handleNetworkChange = async (newNetwork: NetworkInfo) => {
        this._network = newNetwork.name;
        this._api = newNetwork.api;
        this._chainId = newNetwork.chainId;
        this.emit('networkChange', this._network);
      };
      provider?.onNetworkChange(handleNetworkChange);
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }
}

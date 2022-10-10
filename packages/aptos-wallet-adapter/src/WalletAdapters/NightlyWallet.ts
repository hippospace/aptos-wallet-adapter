export const NightlyWallet = () => {};

import { PendingTransaction, TransactionPayload } from 'aptos/src/generated';
import * as SHA3 from 'js-sha3';
import {
  WalletAccountChangeError,
  WalletDisconnectionError,
  WalletNetworkChangeError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSignMessageError,
  WalletSignTransactionError
} from '../WalletProviders/errors';
import {
  AccountKeys,
  BaseWalletAdapter,
  NetworkInfo,
  scopePollingDetectionStrategy,
  WalletAdapterNetwork,
  WalletName,
  WalletReadyState
} from './BaseAdapter';

export class AptosPublicKey {
  private readonly hexString: string;

  static default() {
    return new AptosPublicKey('0'.repeat(64));
  }

  address() {
    const hash = SHA3.sha3_256.create();
    hash.update(Buffer.from(this.asPureHex(), 'hex'));
    hash.update('\x00');
    return '0x' + hash.hex();
  }

  asUint8Array() {
    return new Uint8Array(Buffer.from(this.asPureHex(), 'hex'));
  }

  asString() {
    return this.hexString;
  }

  asPureHex() {
    return this.hexString.substr(2);
  }

  constructor(hexString: string) {
    if (hexString.startsWith('0x')) {
      this.hexString = hexString;
    } else {
      this.hexString = `0x${hexString}`;
    }
  }
}
interface AptosNightly {
  publicKey: AptosPublicKey;
  constructor(eventMap: Map<string, (data: any) => any>);
  connect(onDisconnect?: () => void, eagerConnect?: boolean): Promise<AptosPublicKey>;
  disconnect(): Promise<void>;
  signTransaction: (
    transaction: TransactionPayload,
    submit: boolean
  ) => Promise<Uint8Array | PendingTransaction>;
  signAllTransactions: (transaction: TransactionPayload[]) => Promise<Uint8Array[]>;
  signMessage(msg: string): Promise<Uint8Array>;
  network(): Promise<{ api: string; chainId: number; network: string }>;
}
interface NightlyWindow extends Window {
  nightly?: {
    aptos: AptosNightly;
  };
}

declare const window: NightlyWindow;

export const NightlyWalletName = 'Nightly' as WalletName<'Nightly'>;

export interface NightlyWalletAdapterConfig {
  provider?: AptosNightly;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class NightlyWalletAdapter extends BaseWalletAdapter {
  name = NightlyWalletName;

  url =
    'https://chrome.google.com/webstore/detail/nightly/fiikommddbeccaoicoejoniammnalkfa/related?hl=en&authuser=0';

  icon =
    'https://lh3.googleusercontent.com/_feXM9qulMM5w9BYMLzMpZrxW2WlBmdyg3SbETIoRsHdAD9PANnLCEPabC7lzEK0N8fOyyvFkY3746jk8l73zUErxhU=w128-h128-e365-rj-sc0x00ffffff';

  protected _provider: AptosNightly | undefined;

  protected _network: WalletAdapterNetwork;

  protected _chainId: string;

  protected _api: string;

  protected _timeout: number;

  protected _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  protected _connecting: boolean;

  protected _wallet: {
    publicKey?: string;
    address?: string;
    authKey?: string;
    isConnected: boolean;
  } | null;

  constructor({
    // provider,
    // network = WalletAdapterNetwork.Testnet,
    timeout = 10000
  }: NightlyWalletAdapterConfig = {}) {
    super();

    this._provider = window.nightly?.aptos;
    this._network = undefined;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.nightly?.aptos) {
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

      const provider = this._provider || window.nightly?.aptos;
      const publicKey = await provider?.connect(() => {
        this._wallet = null;
        this.emit('disconnect');
      });
      this._wallet = {
        publicKey: publicKey?.asString(),
        address: publicKey?.address(),
        isConnected: true
      };

      this.emit('connect', this._wallet.publicKey || '');
      const networkData = await provider?.network();
      this._chainId = networkData?.chainId.toString();
      this._api = networkData?.api;
      this._network = networkData?.network.toLocaleLowerCase() as WalletAdapterNetwork;
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
        const provider = this._provider || window.nightly?.aptos;
        await provider?.disconnect();
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit('disconnect');
  }

  async signTransaction(payload: TransactionPayload): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const provider = this._provider || window.nightly?.aptos;
        const response = await provider?.signTransaction(payload, false);
        if (response) {
          return response as Uint8Array;
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

  async signAllTransaction(payload: TransactionPayload[]): Promise<Uint8Array[]> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const provider = this._provider || window.nightly?.aptos;
        const response = await provider?.signAllTransactions(payload);
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

  async signAndSubmitTransaction(tx: TransactionPayload): Promise<PendingTransaction> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const provider = this._provider || window.nightly?.aptos;
        const response = await provider?.signTransaction(tx, true);
        if (response) {
          return response as PendingTransaction;
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error: any) {
        const errMsg = error instanceof Error ? error.message : error.response.data.message;
        throw new WalletSignTransactionError(errMsg);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.nightly.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const response = await provider?.signMessage(message);
      if (response) {
        return Buffer.from(response).toString('hex');
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
      const provider = this._provider || window.nightly.aptos;
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
      const provider = this._provider || window.nightly.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      //To be implemented
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }
}

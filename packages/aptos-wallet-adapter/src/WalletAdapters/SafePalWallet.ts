import { MaybeHexString } from 'aptos';
import {
  TransactionPayload,
  SubmitTransactionRequest,
  HexEncodedBytes
} from 'aptos/dist/generated';
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

interface ConnectSafePalAccount {
  address: MaybeHexString;
  method: string;
  publicKey: MaybeHexString;
  status: number;
}

interface SafePalAccount {
  address: MaybeHexString;
  publicKey: MaybeHexString;
  authKey: MaybeHexString;
  isConnected: boolean;
}
interface ISafePalWallet {
  connect: () => Promise<ConnectSafePalAccount>;
  account(): Promise<SafePalAccount>;
  isConnected(): Promise<boolean>;
  generateTransaction(sender: MaybeHexString, payload: any): Promise<any>;
  signAndSubmitTransaction(transaction: TransactionPayload): Promise<HexEncodedBytes>;
  signTransaction(transaction: TransactionPayload): Promise<HexEncodedBytes>;
  signMessage(message: string): Promise<string>;
  disconnect(): Promise<void>;
}

interface SafePalWindow extends Window {
  safePal?: ISafePalWallet;
}

declare const window: SafePalWindow;

export const SafePalWalletName = 'SafePal' as WalletName<'SafePal'>;

export interface SafePalWalletAdapterConfig {
  provider?: ISafePalWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class SafePalWalletAdapter extends BaseWalletAdapter {
  name = SafePalWalletName;

  url = 'https://chrome.google.com/webstore/detail/SafePal-wallet/lgmpcpglpngdoalbgeoldeajfclnhafa';

  icon = 'https://s.pvcliping.com/coin/bn/SFP_NEW.png';

  protected _provider: ISafePalWallet | undefined;

  // protected _network: WalletAdapterNetwork;
  protected _timeout: number;

  protected _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  protected _connecting: boolean;

  protected _wallet: SafePalAccount | null;

  constructor({
    // provider,
    // network = WalletAdapterNetwork.Mainnet,
    timeout = 10000
  }: SafePalWalletAdapterConfig = {}) {
    super();

    this._provider = typeof window !== 'undefined' ? window.safePal : undefined;
    // this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        this._provider = typeof window !== 'undefined' ? window.safePal : undefined;
        if (this._provider) {
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

      const provider = this._provider || window.safePal;
      const isConnected = await provider?.isConnected();
      if (isConnected) {
        await provider?.disconnect();
      }
      const response = await provider?.connect();

      if (!response) {
        throw new WalletNotConnectedError('No connect response');
      }

      const walletAccount = await provider?.account();
      if (walletAccount) {
        this._wallet = {
          ...walletAccount,
          isConnected: true
        };
      }
      this.emit('connect', this._wallet?.address || '');
    } catch (error: any) {
      this.emit('error', new Error(error));
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

  async signTransaction(transactionPyld: TransactionPayload): Promise<SubmitTransactionRequest> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.safePal;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const tx = await provider.generateTransaction(wallet.address || '', transactionPyld);
      if (!tx) throw new Error('Cannot generate transaction');
      const response = await provider?.signTransaction(tx);

      if (!response) {
        throw new Error('No response');
      }
      const result = { hash: response } as any;
      return result as SubmitTransactionRequest;
    } catch (error: any) {
      this.emit('error', new WalletSignTransactionError(error));
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transactionPyld: TransactionPayload
  ): Promise<{ hash: HexEncodedBytes }> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.safePal;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const tx = await provider.generateTransaction(wallet.address || '', transactionPyld);
      if (!tx) throw new Error('Cannot generate transaction');
      const response = await provider?.signAndSubmitTransaction(tx);

      if (!response) {
        throw new Error('No response');
      }
      return { hash: response };
    } catch (error: any) {
      this.emit('error', new WalletSignAndSubmitMessageError(error));
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.safePal;
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

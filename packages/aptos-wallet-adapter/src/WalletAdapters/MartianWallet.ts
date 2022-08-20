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
  WalletSignTransactionError
} from '../WalletProviders/errors';
import {
  AccountKeys,
  BaseWalletAdapter,
  scopePollingDetectionStrategy,
  WalletName,
  WalletReadyState
} from './BaseAdapter';

interface ConnectMartianAccount {
  address: MaybeHexString;
  method: string;
  publicKey: MaybeHexString;
  status: number;
}

interface MartianAccount {
  address: MaybeHexString;
  publicKey: MaybeHexString;
  authKey: MaybeHexString;
  isConnected: boolean;
}
interface IMartianWallet {
  connect: () => Promise<ConnectMartianAccount>;
  account(): Promise<MartianAccount>;
  isConnected(): Promise<boolean>;
  generateTransaction(sender: MaybeHexString, payload: any): Promise<any>;
  signAndSubmitTransaction(transaction: TransactionPayload): Promise<HexEncodedBytes>;
  signTransaction(transaction: TransactionPayload): Promise<HexEncodedBytes>;
  disconnect(): Promise<void>;
}

interface MartianWindow extends Window {
  martian?: IMartianWallet;
}

declare const window: MartianWindow;

export const MartianWalletName = 'MartianWallet' as WalletName<'MartianWallet'>;

export interface MartianWalletAdapterConfig {
  provider?: IMartianWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class MartianWalletAdapter extends BaseWalletAdapter {
  name = MartianWalletName;

  url = 'https://chrome.google.com/webstore/detail/martian-wallet/efbglgofoippbgcjepnhiblaibcnclgk';

  icon =
    'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F1159842905-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FXillBNDwQOz0oPJ4OtRH%252Ficon%252FaBwgf6d32iEu3YE56Jvk%252Flogo128_squ.png%3Falt%3Dmedia%26token%3D0f5bef1f-a4bd-495e-a447-289c235bb76a';

  protected _provider: IMartianWallet | undefined;

  // protected _network: WalletAdapterNetwork;
  protected _timeout: number;

  protected _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  protected _connecting: boolean;

  protected _wallet: MartianAccount | null;

  constructor({
    // provider,
    // network = WalletAdapterNetwork.Mainnet,
    timeout = 10000
  }: MartianWalletAdapterConfig = {}) {
    super();

    this._provider = typeof window !== 'undefined' ? window.martian : undefined;
    // this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
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

      const provider = this._provider || window.martian;
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
      const provider = this._provider || window.martian;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const tx = await provider.generateTransaction(wallet.address || '', transactionPyld);
      if (!tx) throw new WalletSignTransactionError('Cannot generate transaction');
      const response = await provider?.signTransaction(tx);

      if (!response) {
        throw new WalletSignTransactionError('No response');
      }
      const result = { hash: response } as any;
      return result as SubmitTransactionRequest;
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transactionPyld: TransactionPayload
  ): Promise<{ hash: HexEncodedBytes }> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.martian;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const tx = await provider.generateTransaction(wallet.address || '', transactionPyld);
      if (!tx) throw new WalletSignTransactionError('Cannot generate transaction');
      const response = await provider?.signAndSubmitTransaction(tx);

      if (!response) {
        throw new WalletSignTransactionError('No response');
      }
      return { hash: response };
    } catch (error: any) {
      this.emit('error', new Error(error));
      throw error;
    }
  }
}

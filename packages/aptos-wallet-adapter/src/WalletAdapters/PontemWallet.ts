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

interface ConnectPontemAccount {
  address: MaybeHexString;
  method: string;
  publicKey: MaybeHexString;
  status: number;
}

interface PontemAccount {
  address: MaybeHexString;
  publicKey?: MaybeHexString;
  authKey?: MaybeHexString;
  isConnected: boolean;
}
interface IPontemWallet {
  connect: () => Promise<ConnectPontemAccount>;
  account(): Promise<MaybeHexString>;
  generateTransaction(sender: MaybeHexString, payload: any): Promise<any>;
  signAndSubmit(transaction: TransactionPayload): Promise<{
    success: boolean;
    result: {
      hash: HexEncodedBytes;
    };
  }>;
  // signTransaction(transaction: TransactionPayload): Promise<HexEncodedBytes>;
  disconnect(): Promise<void>;
}

interface PontemWindow extends Window {
  pontem?: IPontemWallet;
}

declare const window: PontemWindow;

export const PontemWalletName = 'PontemWallet' as WalletName<'PontemWallet'>;

export interface PontemWalletAdapterConfig {
  provider?: IPontemWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class PontemWalletAdapter extends BaseWalletAdapter {
  name = PontemWalletName;

  url = 'https://chrome.google.com/webstore/detail/pontem-wallet/phkbamefinggmakgklpkljjmgibohnba';

  icon =
    'https://www.gitbook.com/cdn-cgi/image/width=20,height=20,fit=contain,dpr=2,format=auto/https%3A%2F%2F736486047-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-legacy-files%2Fo%2Fspaces%252F-MVVJKmKQGx983dZy_jr%252Favatar-1619180126965.png%3Fgeneration%3D1619180127194239%26alt%3Dmedia';

  protected _provider: IPontemWallet | undefined;

  // protected _network: WalletAdapterNetwork;
  protected _timeout: number;

  protected _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  protected _connecting: boolean;

  protected _wallet: PontemAccount | null;

  constructor({
    // provider,
    // network = WalletAdapterNetwork.Mainnet,
    timeout = 10000
  }: PontemWalletAdapterConfig = {}) {
    super();

    this._provider = typeof window !== 'undefined' ? window.pontem : undefined;
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

      const provider = this._provider || window.pontem;
      // const isConnected = await provider?.isConnected();
      // if (isConnected) {
      //   await provider?.disconnect();
      // }
      const response = await provider?.connect();

      if (!response) {
        throw new WalletNotConnectedError('No connect response');
      }

      const walletAccount = await provider?.account();
      if (walletAccount) {
        this._wallet = {
          address: walletAccount,
          isConnected: true
        };
      }
      this.emit('connect', this._wallet?.address || '');
    } catch (error: any) {
      this.emit('error', new Error('User has rejected the connection'));
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

  async signTransaction(): Promise<SubmitTransactionRequest> {
    try {
      // const wallet = this._wallet;
      // const provider = this._provider || window.pontem;
      // if (!wallet || !provider) throw new WalletNotConnectedError();
      // const tx = await provider.generateTransaction(
      //   wallet.address || '',
      //   payloadV1ToV0(transactionPyld)
      // );
      // if (!tx) throw new WalletSignTransactionError('Cannot generate transaction');
      // const response = await provider?.signTransaction(tx);

      // if (!response) {
      //   throw new WalletSignTransactionError('No response');
      // }
      // const result = { hash: response } as any;
      return {} as SubmitTransactionRequest;
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
      const provider = this._provider || window.pontem;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const tx = transactionPyld;
      if (!tx) throw new WalletSignTransactionError('Cannot generate transaction');
      const response = await provider?.signAndSubmit(tx);

      if (!response || !response.success) {
        throw new WalletSignTransactionError('No response');
      }
      return { hash: response.result.hash };
    } catch (error: any) {
      this.emit('error', new Error(error.error.message));
      throw error;
    }
  }
}

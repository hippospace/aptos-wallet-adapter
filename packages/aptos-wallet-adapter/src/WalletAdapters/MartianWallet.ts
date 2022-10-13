import { MaybeHexString, Types } from 'aptos';
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
  generateTransaction(sender: MaybeHexString, payload: any, options?: any): Promise<any>;
  signAndSubmitTransaction(transaction: Types.TransactionPayload): Promise<Types.HexEncodedBytes>;
  signTransaction(transaction: Types.TransactionPayload): Promise<Uint8Array>;
  signMessage(message: SignMessagePayload): Promise<SignMessageResponse>;
  disconnect(): Promise<void>;
  getChainId(): Promise<{ chainId: number }>;
  network(): Promise<WalletAdapterNetwork>;
  onAccountChange: (listenr: (newAddress: string) => void) => void;
  onNetworkChange: (listenr: (network: string) => void) => void;
}

interface MartianWindow extends Window {
  martian?: IMartianWallet;
}

declare const window: MartianWindow;

export const MartianWalletName = 'Martian' as WalletName<'Martian'>;

export interface MartianWalletAdapterConfig {
  provider?: IMartianWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class MartianWalletAdapter extends BaseWalletAdapter {
  name = MartianWalletName;

  url = 'https://chrome.google.com/webstore/detail/martian-wallet/efbglgofoippbgcjepnhiblaibcnclgk';

  icon = 'https://raw.githubusercontent.com/hippospace/aptos-wallet-adapter/main/logos/martian.png';

  protected _provider: IMartianWallet | undefined;

  protected _network: WalletAdapterNetwork;

  protected _chainId: string;

  protected _api: string;

  protected _timeout: number;

  protected _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  protected _connecting: boolean;

  protected _wallet: MartianAccount | null;

  constructor({
    // provider,
    // network = WalletAdapterNetwork.Testnet,
    timeout = 10000
  }: MartianWalletAdapterConfig = {}) {
    super();

    this._provider = typeof window !== 'undefined' ? window.martian : undefined;
    this._network = undefined;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.martian) {
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

        try {
          const name = await provider?.network();
          const { chainId } = await provider?.getChainId();
          const api = null;

          this._network = name;
          this._chainId = chainId.toString();
          this._api = api;
        } catch (error: any) {
          const errMsg = error.message;
          this.emit('error', new WalletGetNetworkError(errMsg));
          throw error;
        }
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
    const provider = this._provider || window.martian;
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

  async signTransaction(
    transactionPyld: Types.TransactionPayload,
    options?: any
  ): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.martian;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const tx = await provider.generateTransaction(wallet.address || '', transactionPyld, options);
      if (!tx) throw new Error('Cannot generate transaction');
      const response = await provider?.signTransaction(tx);

      if (!response) {
        throw new Error('No response');
      }
      return response;
    } catch (error: any) {
      this.emit('error', new WalletSignTransactionError(error));
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transactionPyld: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.martian;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const tx = await provider.generateTransaction(wallet.address || '', transactionPyld, options);
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

  async signMessage(msgPayload: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.martian;
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
      const provider = this._provider || window.martian;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      await provider?.onAccountChange((newAccount: string) => {
        this._wallet = {
          ...this._wallet,
          address: newAccount
        };
        this.emit('accountChange', newAccount);
      });
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletAccountChangeError(errMsg));
      throw error;
    }
  }

  async onNetworkChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.martian;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const handleNetworkChange = async (newNetwork: WalletAdapterNetwork) => {
        this._network = newNetwork;
        this.emit('networkChange', this._network);
      };
      await provider?.onNetworkChange(handleNetworkChange);
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }
}

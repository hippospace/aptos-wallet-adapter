import {
  WalletConnectionError,
  WalletDisconnectionError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSignTransactionError
} from '../WalletProviders/errors';
import Web3, { Web3Provider, Web3ProviderType } from '@fewcha/web3';
import {
  AccountKeys,
  BaseWalletAdapter,
  scopePollingDetectionStrategy,
  WalletName,
  WalletReadyState
} from './BaseAdapter';
import {
  TransactionPayload,
  SubmitTransactionRequest,
  HexEncodedBytes
} from 'aptos/dist/generated';

export const FewchaWalletName = 'Fewcha Wallet' as WalletName<'Fewcha Wallet'>;

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

  // protected _network: WalletAdapterNetwork;
  protected _timeout: number;

  protected _readyState: WalletReadyState = WalletReadyState.Installed;

  protected _connecting: boolean;

  protected _wallet: any | null;

  constructor({
    // provider = WEBWALLET_URL,
    // network = WalletAdapterNetwork.Mainnet,
    timeout = 10000
  }: FewchaAdapterConfig = {}) {
    super();

    this._provider =
      typeof window !== 'undefined' ? new Web3(new Web3Provider(window.fewcha)).action : undefined;
    // this._network = network;
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
      const isConnected = await this._provider?.isConnected();
      if (isConnected?.data === true) {
        await provider?.disconnect();
      }
      const response = await provider?.connect();
      if (response.status === 401) {
        throw new WalletConnectionError('User has rejected the connection');
      } else if (response.status !== 200) {
        throw new WalletConnectionError('Wallet connect issue');
      }
      let accountDetail = { ...response.data };

      if (!accountDetail.publicKey) {
        const accountResp = await provider?.account();
        if (!accountResp.data.publicKey) {
          throw new WalletConnectionError('Wallet connect issue', response.data);
        }
        accountDetail = { ...accountResp.data };
      }
      this._wallet = {
        connected: true,
        ...accountDetail
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
    if (wallet) {
      this._wallet = null;

      try {
        const provider = this._provider || window.fewcha;
        const isDisconnected = await provider?.disconnect();
        if (isDisconnected.data === true) {
          this.emit('disconnect');
        } else {
          throw new Error('Disconnect failed');
        }
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }
  }

  async signTransaction(transaction: TransactionPayload): Promise<SubmitTransactionRequest> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      const provider = this._provider || window.fewcha;
      const res = await provider.generateTransaction(transaction);
      if (!res.data) throw new WalletSignTransactionError('Cannot generate transaction');
      const response = await provider?.signTransaction(res.data);

      if (!response) {
        throw new WalletSignTransactionError('No response');
      }
      const result = { hash: response } as any;
      return result as SubmitTransactionRequest;
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : error.response.data.message;
      this.emit('error', new WalletSignTransactionError(errMsg));
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: TransactionPayload
  ): Promise<{ hash: HexEncodedBytes }> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      const provider = this._provider || window.fewcha;
      const tx = await provider.generateTransaction(transaction);
      if (!tx) throw new WalletSignTransactionError('Cannot generate transaction');
      const response = await provider?.signAndSubmitTransaction(tx.data);
      if (response.status === 401) {
        throw new WalletSignTransactionError('User has rejected the transaction');
      } else if (response.status !== 200) {
        throw new WalletSignTransactionError('Transaction issue');
      }
      return {
        hash: response.data
      };
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : error.response.data.message;
      this.emit('error', new WalletSignTransactionError(errMsg));
      throw error;
    }
  }
}

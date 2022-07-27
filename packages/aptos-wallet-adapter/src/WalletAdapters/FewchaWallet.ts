import {
  PendingTransaction,
  SubmitTransactionRequest,
  TransactionPayload
} from 'aptos/dist/api/data-contracts';
import { aptosClient, WEBWALLET_URL } from '../config/aptosConstants';
import {
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

export const FewchaWalletName = 'Fewcha Wallet' as WalletName<'Fewcha Wallet'>;

interface FewchaWindow extends Window {
  fewcha: Web3ProviderType;
}

declare const window: FewchaWindow;

const defaultWeb3 = new Web3(new Web3Provider(window.fewcha));

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

    this._provider = defaultWeb3.action;
    // this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;
    // this._readyState = WalletReadyState.Installed;

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.fewcha) {
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
          return true;
        }
        return false;
      });
    }

    window.addEventListener('aptos#connected', async () => {
      const publicAccount = await this._provider?.account();
      const isConnected = await this._provider?.isConnected();
      if (publicAccount?.publicKey && isConnected) {
        this._wallet = {
          connected: isConnected,
          ...publicAccount
        };
        this.emit('connect', this._wallet.publicKey);
      }
    });

    window.addEventListener('aptos#transaction', (e: any) => {
      if (e?.detail?.tx) {
        this.emit('success', e?.detail?.tx);
      }
    });

    window.addEventListener('aptos#disconnected', () => {
      this.emit('disconnect');
    });
  }

  get publicAccount(): AccountKeys {
    return {
      publicKey: this._wallet?.publicKey || null,
      address: this._wallet?.address || null,
      authKey: this._wallet?.authcKey || null
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
      const provider = this._provider;
      const isConnected = await this._provider?.isConnected();
      if (isConnected) {
        await provider?.disconnect();
      }
      await provider?.connect();
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
        const provider = this._provider;
        await provider?.disconnect();
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }
  }

  async signTransaction(transaction: TransactionPayload): Promise<SubmitTransactionRequest> {
    try {
      const request = new URLSearchParams({
        request: JSON.stringify({
          method: 'signTransaction',
          payload: transaction
        }),
        origin: window.location.origin
      }).toString();
      const popup = window.open(
        `${WEBWALLET_URL}?${request}`,
        'Transaction Confirmation',
        'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=440,height=700'
      );
      if (!popup) throw new WalletNotConnectedError();
      const promise = await new Promise((resolve, reject) => {
        this.once('success', resolve);
        this.once('error', reject);
      });
      return promise as SubmitTransactionRequest;
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signAndSubmitTransaction(transaction: TransactionPayload): Promise<PendingTransaction> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const provider = this._provider;
        const tx = await aptosClient.generateTransaction(wallet.address, transaction);
        await provider?.signAndSubmitTransaction(tx);

        const promise = await new Promise((resolve, reject) => {
          this.once('success', resolve);
          this.once('error', reject);
        });
        return {
          hash: promise
        } as PendingTransaction;
      } catch (error: any) {
        const errMsg = error instanceof Error ? error.message : error.response.data.message;
        throw new WalletSignTransactionError(errMsg);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }
}

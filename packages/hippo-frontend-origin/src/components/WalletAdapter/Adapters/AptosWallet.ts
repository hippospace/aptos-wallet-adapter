import {
  PendingTransaction,
  SubmitTransactionRequest,
  TransactionPayload
} from 'aptos/dist/api/data-contracts';
import {
  WalletDisconnectionError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSignTransactionError
} from '../errors';
import {
  BaseWalletAdapter,
  PublicKey,
  scopePollingDetectionStrategy,
  WalletName,
  WalletReadyState
} from '../types/adapter';

interface IAptosWallet {
  requestId: number;
  connect: () => Promise<string>;
  account: () => Promise<string>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction(transaction: any): Promise<void>;
  signTransaction(transaction: any): Promise<void>;
  disconnect(): Promise<void>;
}

interface AptosWindow extends Window {
  aptos?: IAptosWallet;
}

declare const window: AptosWindow;

export const AptosWalletName = 'AptosWallet' as WalletName<'AptosWallet'>;

export interface AptosWalletAdapterConfig {
  provider?: IAptosWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class AptosWalletAdapter extends BaseWalletAdapter {
  name = AptosWalletName;

  url = '';

  icon = 'https://miro.medium.com/fit/c/176/176/1*Gf747eyRywU8Img0tK5wvw.png';

  protected _provider: IAptosWallet | undefined;

  // protected _network: WalletAdapterNetwork;
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
  }: AptosWalletAdapterConfig = {}) {
    super();

    this._provider = window.aptos;
    // this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.aptos) {
          console.log('MEMEME>>', window.aptos);
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
          return true;
        }
        return false;
      });
    }
  }

  get publicKey(): PublicKey | null {
    return this._wallet?.publicKey || null;
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
      console.log(1);
      if (this.connected || this.connecting) return;
      console.log(2);
      if (
        !(
          this._readyState === WalletReadyState.Loadable ||
          this._readyState === WalletReadyState.Installed
        )
      )
        throw new WalletNotReadyError();
      console.log(3);
      this._connecting = true;

      const provider = window.aptos;
      console.log(4);
      const loggedInAddress = await new Promise<string>((resolve, reject) => {
        // provider?.disconnect();
        console.log(5, provider);
        provider
          ?.connect()
          .then((address) => {
            resolve(address);
          })
          .catch((err) => reject(err));
      });
      this._wallet = {
        publicKey: loggedInAddress
      };
      // console.log(7, loggedInAddress, window.aptos?.publicKey);
      // if (loggedInAddress === window.aptos?.publicKey) {
      //   console.log(8);
      //   this._wallet = {};
      // }
      // console.log(9);
      this.emit('connect', this._wallet.publicKey);
    } catch (error: any) {
      console.log(10, error);
      this.emit('error', error);
      throw error;
    } finally {
      console.log(11);
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;
    if (wallet) {
      this._wallet = null;

      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => resolve(), 250);

          try {
            wallet.disconnect(() => {
              clearTimeout(timeout);
              resolve();
            });
          } catch (err) {
            reject(err);
          }
        });
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit('disconnect');
  }

  async signTransaction(transaction: TransactionPayload): Promise<SubmitTransactionRequest> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const response = await new Promise<SubmitTransactionRequest>((resolve, reject) => {
          wallet.signGenericTransaction(transaction, (resp: any) => {
            console.log('signTransaction', resp);
            if (resp.status === 200) {
              console.log('Transaction is Signed successfully.');
              resolve(resp);
            } else {
              reject(resp.message);
            }
          });
        });
        return response;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
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
        console.log('trans', 1);
        const response = await new Promise<PendingTransaction>((resolve, reject) => {
          console.log('trans 2', wallet, transaction);
          wallet.signGenericTransaction(transaction.type, transaction, (resp: any) => {
            console.log('signTransaction', resp);
            if (resp.status === 200) {
              console.log('Transaction is Signed successfully.');
              resolve(resp);
            } else {
              reject(resp.message);
            }
          });
        });
        return response;
      } catch (error: any) {
        throw new WalletSignTransactionError(error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }
}

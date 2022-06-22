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

interface IMartianWallet {
  connect: (params?: any) => Promise<any>;
  publicKey?: string;
  isConnected?: boolean;
  signGenericTransaction(transaction: any): Promise<void>;
  // signTransaction(transaction: any): Promise<void>;
  disconnect(): Promise<void>;
}

interface MartianWindow extends Window {
  aptos?: IMartianWallet;
}

declare const window: MartianWindow;

export const MartianWalletName = 'MartianWallet' as WalletName<'MartianWallet'>;

export interface HippoWalletAdapterConfig {
  provider?: IMartianWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class MartianWalletAdapter extends BaseWalletAdapter {
  name = MartianWalletName;

  url = '';

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

  protected _wallet: any | null;

  constructor({
    // provider,
    // network = WalletAdapterNetwork.Mainnet,
    timeout = 10000
  }: HippoWalletAdapterConfig = {}) {
    super();

    this._provider = window.aptos;
    // this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.aptos) {
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
        provider?.disconnect();
        console.log(5);
        provider?.connect((respAddress: string) => {
          console.log(6);
          try {
            resolve(respAddress);
          } catch (err) {
            reject(err);
          }
          // 0xc4265dc8a5d90715f8a60bebf16688819427bca928a537ad35f798d4d1267716
        });
      });
      console.log(7, loggedInAddress, window.aptos?.publicKey);
      if (loggedInAddress === window.aptos?.publicKey) {
        console.log(8);
        this._wallet = window.aptos;
      }
      console.log(9);
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
    console.log('disconnect', 1, wallet, this._wallet);
    if (wallet) {
      // wallet.disconnect();

      this._wallet = null;
      console.log('disconnect', 2, wallet, this._wallet);

      // HACK: sol-wallet-adapter doesn't reliably fulfill its promise or emit an event on disconnect
      // const handleDisconnect: (...args: unknown[]) => unknown = (wallet as any).handleDisconnect;
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => resolve(), 250);

          // (wallet as any).handleDisconnect = (...args: unknown[]): unknown => {
          //   clearTimeout(timeout);
          //   resolve();
          //   // HACK: sol-wallet-adapter rejects with an uncaught promise error
          //   (wallet as any)._responsePromises = new Map();
          //   return handleDisconnect.apply(wallet, args);
          // };
          console.log('disconnect', 3, wallet, this._wallet);

          try {
            wallet.disconnect(() => {
              clearTimeout(timeout);
              resolve();
            });
          } catch (err) {
            reject(err);
          }
          // .then(
          //   () => {
          //     clearTimeout(timeout);
          //     resolve();
          //   },
          //   (error: any) => {
          //     clearTimeout(timeout);
          //     // HACK: sol-wallet-adapter rejects with an error on disconnect
          //     if (error?.message === 'Wallet disconnected') {
          //       resolve();
          //     } else {
          //       reject(error);
          //     }
          //   }
          // );
        });
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
      // finally {
      //   (wallet as any).handleDisconnect = handleDisconnect;
      // }
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

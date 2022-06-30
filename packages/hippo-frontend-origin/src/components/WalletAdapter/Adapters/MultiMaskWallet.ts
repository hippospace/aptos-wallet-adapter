import {
  PendingTransaction,
  ScriptFunctionPayload,
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

interface IMultiMaskWallet {
  currentProvider: {
    enable: () => Promise<PublicKey[]>;
    sendAsync(payload: any, callback: (error: Error | null, result?: any) => void): void;
  };
  request: (params?: any) => Promise<any>;
  publicKey?: string;
  isConnected?: boolean;
  signGenericTransaction(transaction: any): Promise<void>;
  // signTransaction(transaction: any): Promise<void>;
  disconnect(): Promise<void>;
}

interface MultiMaskWindow extends Window {
  aptosWeb3?: IMultiMaskWallet;
}

declare const window: MultiMaskWindow;

export const MultiMaskWalletName = 'MultiMaskWallet' as WalletName<'MultiMaskWallet'>;

export interface MultiMaskWalletAdapterConfig {
  provider?: IMultiMaskWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class MultiMaskWalletAdapter extends BaseWalletAdapter {
  name = MultiMaskWalletName;

  url = 'https://github.com/pontem-network/aptos-chrome-extension/releases';

  icon = 'https://liquidswap.pontem.network/img/logo.87454209.svg';

  protected _provider: IMultiMaskWallet | undefined;

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
  }: MultiMaskWalletAdapterConfig = {}) {
    super();

    this._provider = window.aptosWeb3;
    // this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
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
      // console.log(1);
      if (this.connected || this.connecting) return;
      // console.log(2);
      if (
        !(
          this._readyState === WalletReadyState.Loadable ||
          this._readyState === WalletReadyState.Installed
        )
      )
        throw new WalletNotReadyError();
      // console.log(3);
      this._connecting = true;

      const provider = this._provider;
      // console.log(4);

      const wallets = await provider?.currentProvider.enable();
      if (wallets && wallets.length) {
        this._wallet = {
          publicKey: wallets[0],
          isConnected: true
        };
        console.log(9, this._wallet);
        this.emit('connect', this._wallet);
      }
    } catch (error: any) {
      // console.log(10, error);
      this.emit('error', error);
      throw error;
    } finally {
      // console.log(11);
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
            // console.log('signTransaction', resp);
            if (resp.status === 200) {
              // console.log('Transaction is Signed successfully.');
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

  async signAndSubmitTransaction(tempTransaction: TransactionPayload): Promise<PendingTransaction> {
    try {
      const wallet = this._provider;
      if (!wallet) throw new WalletNotConnectedError();
      const transaction = tempTransaction as ScriptFunctionPayload;

      try {
        // console.log('trans', 1);
        const response = await new Promise<PendingTransaction>((resolve, reject) => {
          // const args = [...transaction.type_arguments, transaction.arguments[0] / 1000];
          console.log('trans 2', transaction, transaction.function.split(':')[0]);
          wallet.currentProvider.sendAsync(
            {
              method: 'eth_sendTransaction',
              params: [{ from: transaction.function.split(':')[0] }]
            },
            (error, resp: any) => {
              console.log('signTransaction', error, resp);
              if (error) {
                reject(error.message);
              } else {
                resolve(resp);
              }
              // if (resp.status === 200) {
              //   // console.log('Transaction is Signed successfully.');
              // } else {
              //   reject(resp.message);
              // }
            }
          );
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

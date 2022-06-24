/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PendingTransaction,
  SubmitTransactionRequest,
  TransactionPayload
} from 'aptos/dist/api/data-contracts';
import {
  WalletConfigError,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletDisconnectionError,
  WalletError,
  WalletLoadError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletSignTransactionError,
  WalletTimeoutError,
  WalletWindowBlockedError,
  WalletWindowClosedError
} from '../errors';
import HippoWallet from '../HippoWallet';
import {
  BaseWalletAdapter,
  PublicKey,
  scopePollingDetectionStrategy,
  // WalletAdapter,
  WalletName,
  WalletReadyState
} from '../types/adapter';

interface IHippoWallet {
  postMessage(...args: unknown[]): unknown;
}

export const HippoWalletName = 'HippoExtensionWallet' as WalletName<'HippoExtensionWallet'>;

export interface HippoWalletAdapterConfig {
  provider?: string | IHippoWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class HippoExtensionWalletAdapter extends BaseWalletAdapter {
  name = HippoWalletName;

  url = 'https://hippo-wallet-test.web.app';

  icon = '';

  protected _provider: string | IHippoWallet | undefined;

  // protected _network: WalletAdapterNetwork;
  protected _timeout: number;

  protected _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  protected _connecting: boolean;

  protected _wallet: HippoWallet | null;

  constructor({
    provider,
    // network = WalletAdapterNetwork.Mainnet,
    timeout = 10000
  }: HippoWalletAdapterConfig = {}) {
    super();

    this._provider = provider;
    // this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      if (typeof this._provider === 'string') {
        this._readyState = WalletReadyState.Loadable;
      } else {
        scopePollingDetectionStrategy(() => {
          if (typeof window.hippo?.postMessage === 'function') {
            this._readyState = WalletReadyState.Installed;
            this.emit('readyStateChange', this._readyState);
            return true;
          }
          return false;
        });
      }
    }
  }

  get publicKey(): PublicKey | null {
    return this._wallet?.publicKey || null;
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

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const provider = this._provider || window!.hippo!;

      let wallet: HippoWallet;
      try {
        wallet = new HippoWallet(provider, '');
      } catch (error: any) {
        throw new WalletConfigError(error?.message, error);
      }

      try {
        // HACK: sol-wallet-adapter doesn't reject or emit an event if the popup or extension is closed or blocked
        const handleDisconnect: (...args: unknown[]) => unknown = (wallet as any).handleDisconnect;
        let timeout: NodeJS.Timer | undefined;
        let interval: NodeJS.Timer | undefined;
        try {
          await new Promise<void>((resolve, reject) => {
            const connect = () => {
              if (timeout) clearTimeout(timeout);
              wallet.off('connect', connect);
              resolve();
            };

            (wallet as any).handleDisconnect = (...args: unknown[]): unknown => {
              wallet.off('connect', connect);
              reject(new WalletWindowClosedError());
              return handleDisconnect.apply(wallet, args);
            };

            wallet.on('connect', connect);

            wallet.connect().catch((reason: any) => {
              wallet.off('connect', connect);
              reject(reason);
            });

            if (typeof provider === 'string') {
              let count = 0;

              interval = setInterval(() => {
                const popup = (wallet as any)._popup;
                if (popup) {
                  if (popup.closed) reject(new WalletWindowClosedError());
                } else {
                  if (count > 50) reject(new WalletWindowBlockedError());
                }

                count++;
              }, 100);
            } else {
              // HACK: sol-wallet-adapter doesn't reject or emit an event if the extension is closed or ignored
              timeout = setTimeout(() => reject(new WalletTimeoutError()), this._timeout);
            }
          });
        } finally {
          (wallet as any).handleDisconnect = handleDisconnect;
          if (interval) clearInterval(interval);
        }
      } catch (error: any) {
        if (error instanceof WalletError) throw error;
        throw new WalletConnectionError(error?.message, error);
      }

      if (!wallet.publicKey) throw new WalletPublicKeyError();

      wallet.on('disconnect', this._disconnected);

      this._wallet = wallet;

      this.emit('connect', wallet.publicKey);
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
      wallet.off('disconnect', this._disconnected);

      this._wallet = null;

      // HACK: sol-wallet-adapter doesn't reliably fulfill its promise or emit an event on disconnect
      const handleDisconnect: (...args: unknown[]) => unknown = (wallet as any).handleDisconnect;
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => resolve(), 250);

          (wallet as any).handleDisconnect = (...args: unknown[]): unknown => {
            clearTimeout(timeout);
            resolve();
            // HACK: sol-wallet-adapter rejects with an uncaught promise error
            (wallet as any)._responsePromises = new Map();
            return handleDisconnect.apply(wallet, args);
          };

          wallet.disconnect().then(
            () => {
              clearTimeout(timeout);
              resolve();
            },
            (error: any) => {
              clearTimeout(timeout);
              // HACK: sol-wallet-adapter rejects with an error on disconnect
              if (error?.message === 'Wallet disconnected') {
                resolve();
              } else {
                reject(error);
              }
            }
          );
        });
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      } finally {
        (wallet as any).handleDisconnect = handleDisconnect;
      }
    }

    this.emit('disconnect');
  }

  async signTransaction(transaction: TransactionPayload): Promise<SubmitTransactionRequest> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const response = await wallet.signTransaction(transaction);
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
        const response = await wallet.signAndSubmitTransaction(transaction);
        return response;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  private _disconnected = () => {
    const wallet = this._wallet;
    if (wallet) {
      wallet.off('disconnect', this._disconnected);

      this._wallet = null;

      this.emit('error', new WalletDisconnectedError());
      this.emit('disconnect');
    }
  };
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/space-infix-ops */
import { HexString } from 'aptos';
import {
  PendingTransaction,
  SubmitTransactionRequest,
  TransactionPayload
} from 'aptos/dist/api/data-contracts';
import EventEmitter from 'eventemitter3';
import { PublicKey } from '../types/adapter';

type InjectedProvider = { postMessage: (params: unknown) => void };

export default class HippoWallet extends EventEmitter {
  private _providerUrl: URL | undefined;

  private _injectedProvider?: InjectedProvider;

  private _publicKey: PublicKey | null = null;

  private _popup: Window | null = null;

  private _handlerAdded = false;

  private _nextRequestId = 1;

  private _autoApprove = false;

  private _responsePromises: Map<number, [(value: string) => void, (reason: Error) => void]> =
    new Map();

  constructor(provider: unknown, private _network: string) {
    super();
    if (isInjectedProvider(provider)) {
      this._injectedProvider = provider;
    } else if (isString(provider)) {
      this._providerUrl = new URL(provider);
      this._providerUrl.hash = new URLSearchParams({
        origin: window.location.origin,
        network: this._network
      }).toString();
    } else {
      throw new Error('provider parameter must be an injected provider or a URL string.');
    }
  }

  handleMessage = (
    e: MessageEvent<{
      id: number;
      method: string;
      params: {
        autoApprove: boolean;
        publicKey: string;
      };
      result?: string;
      error?: string;
    }>
  ): void => {
    if (
      (this._injectedProvider && e.source === window) ||
      (e.origin === this._providerUrl?.origin && e.source === this._popup)
    ) {
      if (e.data.method === 'connected') {
        const newPublicKey = HexString.ensure(e.data.params.publicKey);
        if (!this._publicKey || this._publicKey !== newPublicKey) {
          if (this._publicKey && this._publicKey !== newPublicKey) {
            this.handleDisconnect();
          }
          this._publicKey = newPublicKey;
          this._autoApprove = !!e.data.params.autoApprove;
          this.emit('connect', this._publicKey);
        }
      } else if (e.data.method === 'disconnected') {
        this.handleDisconnect();
      } else if (e.data.result || e.data.error) {
        const promises = this._responsePromises.get(e.data.id);
        if (promises) {
          const [resolve, reject] = promises;
          if (e.data.result) {
            resolve(e.data.result);
          } else {
            reject(new Error(e.data.error));
          }
        }
      }
    }
  };

  private handleConnect() {
    if (!this._handlerAdded) {
      this._handlerAdded = true;
      window.addEventListener('message', this.handleMessage);
      window.addEventListener('beforeunload', this._beforeUnload);
    }
    if (this._injectedProvider) {
      return new Promise<void>((resolve) => {
        void this.sendRequest('connect', {});
        resolve();
      });
    } else {
      window.name = 'parent';
      this._popup = window.open(
        this._providerUrl?.toString(),
        '_blank',
        'location,resizable,width=460,height=675'
      );
      return new Promise((resolve) => {
        this.once('connect', resolve);
      });
    }
  }

  private handleDisconnect() {
    if (this._handlerAdded) {
      this._handlerAdded = false;
      window.removeEventListener('message', this.handleMessage);
      window.removeEventListener('beforeunload', this._beforeUnload);
    }
    if (this._publicKey) {
      this._publicKey = null;
      this.emit('disconnect');
    }
    this._responsePromises.forEach(([, reject], id) => {
      this._responsePromises.delete(id);
      reject(new Error('Wallet disconnected'));
    });
  }

  private async sendRequest(method: string, params: Record<string, unknown>) {
    if (method !== 'connect' && !this.connected) {
      throw new Error('Wallet not connected');
    }
    const requestId = this._nextRequestId;
    ++this._nextRequestId;
    return new Promise((resolve, reject) => {
      this._responsePromises.set(requestId, [resolve, reject]);
      if (this._injectedProvider) {
        this._injectedProvider.postMessage({
          jsonrpc: '2.0',
          id: requestId,
          method,
          params: {
            network: this._network,
            ...params
          }
        });
      } else {
        this._popup?.postMessage(
          {
            jsonrpc: '2.0',
            id: requestId,
            method,
            params
          },
          this._providerUrl?.origin ?? ''
        );

        if (!this.autoApprove) {
          this._popup?.focus();
        }
      }
    });
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connected(): boolean {
    return this._publicKey !== null;
  }

  get autoApprove(): boolean {
    return this._autoApprove;
  }

  async connect(): Promise<void> {
    if (this._popup) {
      this._popup.close();
    }
    await this.handleConnect();
  }

  async disconnect(): Promise<void> {
    if (this._injectedProvider) {
      await this.sendRequest('disconnect', {});
    }
    if (this._popup) {
      this._popup.close();
    }
    this.handleDisconnect();
  }

  private _beforeUnload = (): void => {
    void this.disconnect();
  };

  async signAndSubmitTransaction(transaction: TransactionPayload): Promise<PendingTransaction> {
    // const response = (await this.sendRequest('signTransaction', {
    //   message: bs58.encode(transaction.serializeMessage())
    // })) as { publicKey: string; signature: string };
    // const signature = bs58.decode(response.signature);
    // const publicKey = new PublicKey(response.publicKey);
    // transaction.addSignature(publicKey, signature);
    return {} as PendingTransaction;
  }

  async signTransaction(transaction: TransactionPayload): Promise<SubmitTransactionRequest> {
    // const response = (await this.sendRequest('signTransaction', {
    //   message: bs58.encode(transaction.serializeMessage())
    // })) as { publicKey: string; signature: string };
    // const signature = bs58.decode(response.signature);
    // const publicKey = new PublicKey(response.publicKey);
    // transaction.addSignature(publicKey, signature);
    return {} as SubmitTransactionRequest;
  }
}

function isString(a: unknown): a is string {
  return typeof a === 'string';
}

function isInjectedProvider(a: unknown): a is InjectedProvider {
  return isObject(a) && 'postMessage' in a && typeof a.postMessage === 'function';
}

function isObject(a: unknown): a is Record<string, unknown> {
  return typeof a === 'object' && a !== null;
}

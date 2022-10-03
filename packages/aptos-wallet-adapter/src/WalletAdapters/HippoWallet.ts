import { MaybeHexString } from 'aptos';
import { TransactionPayload, HexEncodedBytes } from 'aptos/src/generated';
import { WEBWALLET_URL } from '../config/aptosConstants';
import {
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSignAndSubmitMessageError
} from '../WalletProviders/errors';
import { AccountKeys, BaseWalletAdapter, WalletName, WalletReadyState } from './BaseAdapter';

export const HippoWalletName = 'Hippo Web' as WalletName<'Hippo Web'>;

export interface HippoWalletAdapterConfig {
  provider?: string;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class HippoWalletAdapter extends BaseWalletAdapter {
  name = HippoWalletName;

  url = 'https://hippo-wallet-test.web.app';

  icon = 'https://ui-test1-22e7c.web.app/static/media/hippo_logo.ecded6bf411652de9b7f.png';

  protected _provider: string | undefined;

  // protected _network: WalletAdapterNetwork;
  protected _timeout: number;

  protected _readyState: WalletReadyState = WalletReadyState.Installed;

  protected _connecting: boolean;

  protected _wallet: any | null;

  constructor({
    // provider = WEBWALLET_URL,
    // network = WalletAdapterNetwork.Mainnet,
    timeout = 10000
  }: HippoWalletAdapterConfig = {}) {
    super();

    this._provider = WEBWALLET_URL || 'https://hippo-wallet-test.web.app';
    // this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;
    this._readyState = WalletReadyState.Installed;
  }

  get publicAccount(): AccountKeys {
    return {
      publicKeys: this._wallet?.publicKey || null,
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

  handleMessage = (
    e: MessageEvent<{
      id: number;
      method: string;
      address?: {
        hexString: MaybeHexString;
      };
      publicKey?: {
        hexString: MaybeHexString;
      };
      authKey?: {
        hexString: MaybeHexString;
      };
      detail?: {
        hash: MaybeHexString;
      };
      error?: string;
    }>
  ): void => {
    if (e.origin === this._provider) {
      if (e.data.method === 'account') {
        this._wallet = {
          connected: true,
          publicKeys: e.data.publicKey ? [e.data.publicKey] : null,
          address: e.data.address || null,
          authKey: e.data.authKey || null
        };
        this.emit('connect', this._wallet.publicKeys);
      } else if (e.data.method === 'success') {
        this.emit('success', e.data.detail?.hash);
      } else if (e.data.method === 'fail') {
        this.emit('error', new WalletSignAndSubmitMessageError(e.data.error));
      } else if (e.data.method === 'disconnected') {
        this.disconnect();
      }
    }
  };

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

      window.addEventListener('message', this.handleMessage);
      window.addEventListener('beforeunload', this._beforeUnload);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    window.removeEventListener('message', this.handleMessage);
    window.removeEventListener('beforeunload', this._beforeUnload);
    this._wallet = null;
    this.emit('disconnect');
  }

  async signTransaction(transaction: TransactionPayload): Promise<Uint8Array> {
    try {
      const request = new URLSearchParams({
        request: JSON.stringify({
          method: 'signTransaction',
          payload: transaction
        }),
        origin: window.location.origin,
        isPopUp: 'true'
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
      return promise as Uint8Array;
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: TransactionPayload
  ): Promise<{ hash: HexEncodedBytes }> {
    try {
      const request = new URLSearchParams({
        request: JSON.stringify({
          method: 'signAndSubmit',
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
      return promise as { hash: HexEncodedBytes };
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    try {
      const request = new URLSearchParams({
        request: JSON.stringify({
          method: 'signMessage',
          payload: message
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
      return promise as string;
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  private _beforeUnload = (): void => {
    void this.disconnect();
  };
}

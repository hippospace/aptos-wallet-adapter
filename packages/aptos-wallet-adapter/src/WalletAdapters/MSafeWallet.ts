import { HexString, MaybeHexString, Types } from 'aptos';
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
  SignMessagePayload,
  SignMessageResponse,
  WalletAdapterNetwork,
  WalletName,
  WalletReadyState
} from './BaseAdapter';
import { Account, MSafeWallet } from 'msafe-wallet';

export const MSafeWalletName = 'MSafe' as WalletName<'MSafe'>;

interface MSafeAccount {
  address: MaybeHexString;
  publicKey: MaybeHexString[];
  authKey: MaybeHexString;
  minKeysRequired: number;
  isConnected: boolean;
}

export class MSafeWalletAdapter extends BaseWalletAdapter {
  name = MSafeWalletName;

  icon = 'https://raw.githubusercontent.com/hippospace/aptos-wallet-adapter/main/logos/msafe.png';

  protected _provider: MSafeWallet | undefined;

  protected _network: WalletAdapterNetwork;

  protected _chainId: string;

  // MSafeWallet only works in msafe appstore iframe
  protected _readyState: WalletReadyState = MSafeWallet.inMSafeWallet()
    ? WalletReadyState.NotDetected
    : WalletReadyState.Unsupported;

  protected _connecting: boolean;

  protected _wallet: MSafeAccount | null;

  private _origin?: string | string[];

  /**
   * @description create a MSafeWalletAdapter
   * @param origin allowlist of msafe website url, omit means accpets all msafe websites. you can pass a single url or an array of urls.
   * @example
   *  // 1. Initialize MSafeWalletAdapter with default allowlist:
   *      new MSafeWalletAdapter();
   *  // 2. Initialize MSafeWalletAdapter with a single MSafe url:
   *      new MSafeWalletAdapter('https://app.m-safe.io');
   *  // 3. Initialize MSafeWalletAdapter with an array of MSafe urls:
   *      new MSafeWalletAdapter(['https://app.m-safe.io', 'https://testnet.m-safe.io', 'https://partner.m-safe.io']);
   *  // 4. Initialize MSafeWalletAdapter with a single network type:
   *      new MSafeWalletAdapter('Mainnet');
   *  // 5. Initialize MSafeWalletAdapter with an array of network types:
   *      new MSafeWalletAdapter(['Mainnet', 'Testnet', 'Partner']);
   */
  constructor(origin?: string | string[]) {
    super();
    this._network = undefined;
    this._connecting = false;
    this._origin = origin;
    if (this._readyState === WalletReadyState.NotDetected) {
      MSafeWallet.new(origin)
        .then((msafe) => {
          this._provider = msafe;
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
        })
        .catch((e) => {
          this._readyState = WalletReadyState.Unsupported;
          this.emit('readyStateChange', this._readyState);
          console.error('MSafe connect error:', e);
        });
    }
  }

  /// fix issue of next.js: access url via getter to avoid access window object in constructor
  get url() {
    return MSafeWallet.getAppUrl(this._origin instanceof Array ? this._origin[0] : this._origin);
  }

  get publicAccount(): AccountKeys {
    return {
      publicKey: this._wallet?.publicKey,
      address: this._wallet?.address,
      authKey: this._wallet?.authKey,
      minKeysRequired: this._wallet?.minKeysRequired
    };
  }

  get network(): NetworkInfo {
    return {
      name: this._network,
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

      const provider = this._provider;
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
        } as any;

        try {
          const name = await provider?.network();
          const chainId = await provider?.chainId();

          this._network = name as WalletAdapterNetwork;
          this._chainId = chainId.toString();
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

  async signTransaction(
    transactionPyld: Types.TransactionPayload,
    options?: any
  ): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      const provider = this._provider;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const response = await provider.signTransaction(transactionPyld as any, options);

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
      const provider = this._provider;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const response = await provider.signAndSubmit(transactionPyld as any, options);

      if (!response) {
        throw new Error('No response');
      }
      return { hash: HexString.fromUint8Array(response).hex() };
    } catch (error: any) {
      this.emit('error', new WalletSignAndSubmitMessageError(error));
      throw error;
    }
  }

  async signMessage(msgPayload: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const wallet = this._wallet;
      const provider = this._provider;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const response = await provider.signMessage(msgPayload as any);
      if (response) {
        return response as any;
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
      const provider = this._provider;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const handleChangeAccount = async (newAccount: Account) => {
        this._wallet = {
          ...this._wallet,
          ...newAccount
        };
        this.emit('accountChange', newAccount.address);
      };
      provider.onChangeAccount(handleChangeAccount);
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletAccountChangeError(errMsg));
      throw error;
    }
  }

  async onNetworkChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const handleNetworkChange = async (newNetwork: WalletAdapterNetwork) => {
        this._network = newNetwork;
        this._chainId = (await this._provider.chainId()).toString();
        this.emit('networkChange', this._network);
      };
      provider.onChangeNetwork(handleNetworkChange);
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }
}

/**
 * @deprecated Use `MSafeWalletName` instead.
 */
export const MsafeWalletName = MSafeWalletName;
/**
 * @deprecated Use `MSafeWalletAdapter` instead.
 */
export class MsafeWalletAdapter extends MSafeWalletAdapter {}

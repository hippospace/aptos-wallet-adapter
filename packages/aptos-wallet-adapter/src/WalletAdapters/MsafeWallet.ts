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
import { Account, MsafeWallet } from 'msafe-wallet';

export const MsafeWalletName = 'Msafe' as WalletName<'Msafe'>;

interface MsafeAccount {
  address: MaybeHexString;
  publicKey: MaybeHexString;
  authKey: MaybeHexString;
  isConnected: boolean;
}

export class MsafeWalletAdapter extends BaseWalletAdapter {
  name = MsafeWalletName;

  url = MsafeWallet.getOrigin();

  icon = 'https://raw.githubusercontent.com/hippospace/aptos-wallet-adapter/main/logos/msafe.png';

  protected _provider: MsafeWallet | undefined;

  protected _network: WalletAdapterNetwork;

  protected _chainId: string;

  // MsafeWallet only works in msafe appstore iframe
  protected _readyState: WalletReadyState = MsafeWallet.inMsafeWallet()
    ? WalletReadyState.NotDetected
    : WalletReadyState.Unsupported;

  protected _connecting: boolean;

  protected _wallet: MsafeAccount | null;

  constructor(origin: 'Mainnet' | 'Testnet' | string = 'Mainnet') {
    super();
    this._network = undefined;
    this._connecting = false;
    const msafeOrigin = MsafeWallet.getOrigin(origin);
    this.url = MsafeWallet.getAppUrl(origin);
    if (this._readyState === WalletReadyState.NotDetected) {
      MsafeWallet.new(msafeOrigin)
        .then((msafe) => {
          this._provider = msafe;
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
        })
        .catch((e) => console.log(e));
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

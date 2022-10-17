import { Types } from 'aptos';
import BloctoSDK, { AptosProviderInterface as IBloctoAptos } from '@blocto/sdk';
import {
  WalletAccountChangeError,
  WalletDisconnectionError,
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
  scopePollingDetectionStrategy,
  WalletName,
  WalletReadyState,
  SignMessagePayload,
  SignMessageResponse,
  NetworkInfo,
  WalletAdapterNetwork
} from './BaseAdapter';

export const BloctoWalletName = 'Blocto' as WalletName<'Blocto'>;

export interface BloctoWalletAdapterConfig {
  provider?: IBloctoAptos;
  network: Exclude<WalletAdapterNetwork, WalletAdapterNetwork.Devnet>;
  timeout?: number;
  bloctoAppId?: string;
}

export const APTOS_NETWORK_CHAIN_ID_MAPPING = {
  // MAINNET
  [WalletAdapterNetwork.Mainnet]: 1,
  // TESTNET
  [WalletAdapterNetwork.Testnet]: 2
};

export class BloctoWalletAdapter extends BaseWalletAdapter {
  name = BloctoWalletName;

  url = 'https://portto.com/download';

  icon = 'https://raw.githubusercontent.com/hippospace/aptos-wallet-adapter/main/logos/blocto.svg';

  protected _provider: IBloctoAptos | undefined;

  protected _network: Exclude<WalletAdapterNetwork, WalletAdapterNetwork.Devnet>;

  protected _chainId: string;

  protected _api: string;

  protected _timeout: number;

  protected _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  protected _connecting: boolean;

  protected _wallet: any | null;

  constructor(
    { network, timeout = 10000, bloctoAppId = '' }: BloctoWalletAdapterConfig = {
      network: WalletAdapterNetwork.Testnet
    }
  ) {
    super();

    const sdk = new BloctoSDK({
      aptos: {
        chainId: APTOS_NETWORK_CHAIN_ID_MAPPING[network]
      },
      appId: bloctoAppId
    });

    this._provider = sdk.aptos;
    this._network = network;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window) {
          this._readyState = WalletReadyState.Installed;
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
      authKey: this._wallet?.authKey || null,
      minKeysRequired: this._wallet?.minKeysRequired
    };
  }

  get network(): NetworkInfo {
    return {
      name: this._network,
      api: this._api,
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

      const { publicKey, ...rest } = await provider?.connect();
      this._wallet = {
        ...rest,
        publicKey,
        isConnected: true
      };

      const { api, chainId } = await provider.network();
      this._api = api;
      this._chainId = chainId;

      this.emit('connect', this._wallet);
    } catch (error: any) {
      this.emit('error', error);
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

  async signTransaction(transaction: Types.TransactionPayload): Promise<Uint8Array> {
    try {
      try {
        const provider = this._provider;
        const response = await provider?.signTransaction(transaction as Types.EntryFunctionPayload);
        if (response) {
          return new Uint8Array([]);
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      try {
        const provider = this._provider;
        const response = await provider?.signAndSubmitTransaction(
          transaction as Types.EntryFunctionPayload
        );
        if (response) {
          return { hash: response.hash };
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error: any) {
        throw new WalletSignAndSubmitMessageError(error.message || error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const provider = this._provider;
      const response = await provider?.signMessage(message);

      if (response) {
        return response;
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
      //To be implemented
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
      //To be implemented
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }
}

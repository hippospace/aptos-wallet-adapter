import { MaybeHexString } from 'aptos';
import { TransactionPayload, HexEncodedBytes } from 'aptos/src/generated';
import {
    WalletDisconnectionError,
    WalletNotConnectedError,
    WalletGetNetworkError,
    WalletNotReadyError,
    WalletSignAndSubmitMessageError,
    WalletSignMessageError,
    WalletSignTransactionError
} from '../WalletProviders/errors';
import {
    AccountKeys,
    BaseWalletAdapter,
    NetworkInfo,
    scopePollingDetectionStrategy,
    SignMessagePayload,
    SignMessageResponse,
    WalletAdapterNetwork,
    WalletName,
    WalletReadyState
} from './BaseAdapter';

interface TokenPocketAccount {
    address: MaybeHexString;
    publicKey: MaybeHexString;
}

interface ITokenPocketWallet {
    isTokenPocket: boolean;
    connect: () => Promise<TokenPocketAccount>;
    account: () => Promise<TokenPocketAccount>;
    isConnected: () => Promise<boolean>;
    signAndSubmitTransaction(
        transaction: TransactionPayload,
        options?: any
    ): Promise<{ hash: HexEncodedBytes }>;
    network: () => Promise<WalletAdapterNetwork>;
    getChainId: () => Promise<string>;
    getNodeUrl: () => Promise<string>;
    signTransaction(transaction: TransactionPayload, options?: any): Promise<Uint8Array>;
    signMessage(message: SignMessagePayload): Promise<SignMessageResponse>;
    disconnect(): Promise<void>;
    onAccountChange: (listener: (newAddress: TokenPocketAccount) => void) => void;
    onNetworkChange: (listener: (network: { networkName: string }) => void) => void;
}

interface TokenPocketWindow extends Window {
    aptos?: ITokenPocketWallet;
}

declare const window: TokenPocketWindow;

export const TokenPocketWalletName = 'TokenPocket' as WalletName<'TokenPocket'>;

export interface TokenPocketWalletAdapterConfig {
    provider?: ITokenPocketWallet;
    // network?: WalletAdapterNetwork;
    timeout?: number;
}

export class TokenPocketWalletAdapter extends BaseWalletAdapter {
    name = TokenPocketWalletName;

    url = 'https://tokenpocket.pro';

    icon = 'https://tp-statics.tokenpocket.pro/logo/tokenpocket.png';

    protected _provider: ITokenPocketWallet | undefined;

    protected _network: WalletAdapterNetwork;

    protected _chainId: string;

    protected _api: string;

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
    }: TokenPocketWalletAdapterConfig = {}) {
        super();

        this._provider = typeof window !== 'undefined' ? window.aptos : undefined;
        this._network = undefined;
        this._timeout = timeout;
        this._connecting = false;
        this._wallet = null;

        if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.aptos && window.aptos?.isTokenPocket) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
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
            authKey: this._wallet?.authKey || null
        };
    }

    get network(): NetworkInfo {
        return {
            name: this._network,
            api: this._api,
            chainId: this._chainId
        }
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

            const provider = this._provider || window.aptos;
            const isConnected = await provider?.isConnected();
            if (isConnected) {
                await provider?.disconnect();
            }
            const response = await provider?.connect();

            if (!response) {
                throw new WalletNotConnectedError('No connect response');
            }

            this._wallet = {
                address: response?.address,
                publicKey: response?.publicKey,
                isConnected: true
            };

            try {
                const network = await provider?.network();
                const chainId = await provider?.getChainId();
                const api = await provider?.getNodeUrl();

                this._network = network;
                this._chainId = chainId;
                this._api = api;
            } catch (error: any) {
                const errMsg = error.message;
                this.emit('error', new WalletGetNetworkError(errMsg));
                throw error;
            }

            this.emit('connect', this._wallet.address);
        } catch (error: any) {
            this.emit('error', new Error(error));
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const wallet = this._wallet;
        const provider = this._provider || window.aptos;
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

    async signTransaction(transaction: TransactionPayload, options?: any): Promise<Uint8Array> {
        try {
            const wallet = this._wallet;
            const provider = this._provider || window.aptos;
            if (!wallet || !provider) throw new WalletNotConnectedError();

            const response = await provider.signTransaction(transaction, options);

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
        transaction: TransactionPayload,
        options?: any
    ): Promise<{ hash: HexEncodedBytes }> {
        try {
            const wallet = this._wallet;
            const provider = this._provider || window.aptos;
            if (!wallet || !provider) throw new WalletNotConnectedError();

            const response = await provider.signAndSubmitTransaction(transaction, options);

            if (!response) {
                throw new Error('No response');
            }
            return response as { hash: HexEncodedBytes };
        } catch (error: any) {
            this.emit('error', new WalletSignAndSubmitMessageError(error));
            throw error;
        }
    }

    async signMessage(msgPayload: SignMessagePayload): Promise<SignMessageResponse> {
        try {
            const wallet = this._wallet;
            const provider = this._provider || window.aptos;
            if (!wallet || !provider) throw new WalletNotConnectedError();
            if (typeof msgPayload !== 'object' || !msgPayload.nonce) {
                throw new WalletSignMessageError('Invalid signMessage Payload');
            }
            const response = await provider?.signMessage(msgPayload);
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


    async onNetworkChange(): Promise<void> {

    }

    async onAccountChange(): Promise<void> {

    }


}

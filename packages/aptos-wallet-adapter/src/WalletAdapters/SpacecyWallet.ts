

import { MaybeHexString, Types } from 'aptos';
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
    scopePollingDetectionStrategy,
    SignMessagePayload,
    SignMessageResponse,
    WalletAdapterNetwork,
    WalletName,
    WalletReadyState
} from './BaseAdapter';
interface ConnectSpacecyAccount {
    address: MaybeHexString;
    method: string;
    publicKey: MaybeHexString;
    status: number;
}

interface SpacecyAccount {
    address: MaybeHexString;
    publicKey?: MaybeHexString;
    authKey?: MaybeHexString;
    isConnected: boolean;
}
export interface ISpacecyWallet {
    checkIsConnectedAndAccount: () => Promise<{ isConnected: boolean, accountWallet: MaybeHexString }>;
    connect: () => Promise<ConnectSpacecyAccount>;
    account(): Promise<MaybeHexString>;
    publicKey(): Promise<MaybeHexString>;
    signAndSubmitTransaction(
        transaction: Types.TransactionPayload,
        options?: any
    ): Promise<{
        status: number;
        data: Types.HexEncodedBytes;
        method: 'signAndSubmitTransaction';
    }>;
    isConnected(): Promise<boolean>;
    signTransaction(transaction: Types.TransactionPayload, options?: any): Promise<{
        status: number;
        data: Uint8Array;
        method: 'signTransaction';
    }>
    signMessage(message: SignMessagePayload): Promise<{
        status: number;
        data: SignMessageResponse;
        method: 'signMessage';
    }>;
    generateTransaction(sender: MaybeHexString, payload: any, options?: any): Promise<any>;
    disconnect(): Promise<void>;
    chainId(): Promise<void>;
    network(): Promise<NetworkInfo>;
    onAccountChange(listener: (address: string | undefined) => void): Promise<void>;
    onNetworkChange(listener: (network: NetworkInfo) => void): Promise<void>;
}



interface SpacecyWindow extends Window {
    spacecy?: ISpacecyWallet;
}

declare const window: SpacecyWindow;

const SpacecyWalletName = 'Spacecy' as WalletName<'Spacecy'>;

export interface SpacecyWalletAdapterConfig {
    provider?: ISpacecyWallet;
    // network?: WalletAdapterNetwork;
    timeout?: number;
}

export class SpacecyWalletAdapter extends BaseWalletAdapter {
    name = SpacecyWalletName;

    url = 'https://chrome.google.com/webstore/detail/spacecy-wallet/mkchoaaiifodcflmbaphdgeidocajadp?hl=en-US';

    icon = 'https://spacecywallet.com/favicon.ico';

    protected _provider: ISpacecyWallet | undefined;

    protected _network: WalletAdapterNetwork | undefined;

    protected _chainId: string | undefined;

    protected _api: string | undefined;

    protected _timeout: number;

    protected _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    protected _connecting: boolean;

    protected _wallet: SpacecyAccount | null;

    constructor({
        // provider,
        // network = WalletAdapterNetwork.Testnet,
        timeout = 10000
    }: SpacecyWalletAdapterConfig = {}) {
        super();

        this._provider = typeof window !== 'undefined' ? window.spacecy : undefined;
        this._network = undefined;
        this._timeout = timeout;
        this._connecting = false;
        this._wallet = null;

        if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.spacecy) {
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
            const provider = this._provider || window.spacecy;
            const response: any = await provider?.connect()




            if (!response) {
                throw new WalletNotConnectedError('No connect response');
            }
            const walletAccount = response.data.address;
            const publicKey = response.data.publicKey;
            if (walletAccount) {
                this._wallet = {
                    address: walletAccount,
                    publicKey,
                    isConnected: true
                };

                try {
                    const networkInfo: any = await provider?.chainId();
                    if (networkInfo) {
                        this._network = networkInfo.data.networkName;
                        this._chainId = networkInfo.data.chainId;
                        this._api = networkInfo.data.rpcProvider
                    }
                } catch (error: any) {
                    const errMsg = error.message;
                    this.emit('error', new WalletGetNetworkError(errMsg));
                    throw error;
                }
            }


            this.emit('connect', this._wallet?.address || '');
        } catch (error: any) {
            this.emit('error', new Error('User has rejected the connection'));
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const wallet = this._wallet;
        const provider = this._provider || window.spacecy;
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
            const provider = this._provider || window.spacecy;
            if (!wallet || !provider) throw new WalletNotConnectedError();
            const tx = await provider.generateTransaction(wallet.address || '', transactionPyld, options);
            if (!tx) throw new Error('Cannot generate transaction');
            const response = await provider?.signTransaction(tx.data);
            if (!response) {
                throw new Error('No response');
            }
            return response.data;
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
            const provider = this._provider || window.spacecy;
            if (!wallet || !provider) throw new WalletNotConnectedError();
            const response = await provider?.signAndSubmitTransaction(transactionPyld, options);


            if (!response || response.status != 200) {
                throw new Error('No response');
            }
            return { hash: response.data };
        } catch (error: any) {
            this.emit('error', new WalletSignAndSubmitMessageError(error.message));
            throw error;
        }
    }


    async signMessage(msgPayload: SignMessagePayload): Promise<SignMessageResponse> {
        try {
            const wallet = this._wallet;
            const provider = this._provider || window.spacecy;
            if (!wallet || !provider) throw new WalletNotConnectedError();
            if (typeof msgPayload !== 'object' || !msgPayload.nonce) {
                throw new WalletSignMessageError('Invalid signMessage Payload');
            }
            const response = await provider?.signMessage(msgPayload);
            if (response.status == 200) {
                return response.data;
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
            const provider = this._provider || window.spacecy;
            if (!wallet || !provider) throw new WalletNotConnectedError();
            const handleAccountChange = async (newAccount: any) => {
                // disconnect wallet if newAccount is undefined
                if (newAccount.data == 'no account') {
                    if (this.connected) {
                        await this.disconnect();
                    }
                    return;
                }
                if (newAccount.data == "") {
                    this._wallet = { publicKey: "", address: "", authKey: "", isConnected: false }
                }
                // const newPublicKey = await provider?.publicKey();
                if (this._wallet != null) {
                    this._wallet = {
                        ...this._wallet,
                        address: newAccount.data == 'no account' ? undefined : newAccount.data,
                        publicKey: undefined
                    };
                }
                this.emit('accountChange', newAccount);
            };
            await provider?.onAccountChange(handleAccountChange);
        } catch (error: any) {
            const errMsg = error.message;
            this.emit('error', new WalletAccountChangeError(errMsg));
            throw error;
        }
    }

    async onNetworkChange(): Promise<void> {
        try {
            const wallet = this._wallet;
            const provider = this._provider || window.spacecy;
            if (!wallet || !provider) throw new WalletNotConnectedError();
            const handleNetworkChange = (network: any) => {
                this._network = network.data.networkName;
                this._api = network.data.rpcProvider
                this._chainId = network.data.chainId;
                if (this._network) {
                    this.emit('networkChange', this._network);
                }
            };
            await provider?.onNetworkChange(handleNetworkChange);
        } catch (error: any) {
            const errMsg = error.message;
            this.emit('error', new WalletNetworkChangeError(errMsg));
            throw error;
        }
    }
}
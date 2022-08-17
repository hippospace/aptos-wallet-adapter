export const NightlyWallet = () => {};
// import { TxnBuilderTypes, BCS } from 'aptos';
// import {
//   PendingTransaction,
//   ScriptFunctionPayload,
//   SubmitTransactionRequest,
//   TransactionPayload
// } from 'aptos/dist/api/data-contracts';
// import {
//   ScriptFunction,
//   StructTag,
//   TransactionPayloadScriptFunction,
//   TypeTagStruct
// } from 'aptos/dist/transaction_builder/aptos_types';
// import { bcsSerializeUint64, bcsToBytes, Seq } from 'aptos/dist/transaction_builder/bcs';
// import { aptosClient } from '../config/aptosConstants';
// import {
//   WalletDisconnectionError,
//   WalletNotConnectedError,
//   WalletNotReadyError,
//   WalletSignTransactionError
// } from '../WalletProviders/errors';
// import {
//   AccountKeys,
//   Address,
//   AuthKey,
//   BaseWalletAdapter,
//   PublicKey,
//   scopePollingDetectionStrategy,
//   WalletName,
//   WalletReadyState
// } from './BaseAdapter';

// interface INightlyWallet {
//   requestId: number;
//   connect: (onDisconnect?: () => void, eager?: boolean) => Promise<any>;
//   account: () => Promise<string>;
//   isConnected: () => Promise<boolean>;
//   signAndSubmitTransaction(transaction: any): Promise<void>;
//   signTransaction(transaction: any): Promise<any>;
//   disconnect(): Promise<void>;
// }

// interface NightlyWindow extends Window {
//   nightly?: {
//     aptos: INightlyWallet;
//   };
// }

// declare const window: NightlyWindow;

// export const NightlyWalletName = 'Nightly Wallet' as WalletName<'Nightly Wallet'>;

// export interface NightlyWalletAdapterConfig {
//   provider?: INightlyWallet;
//   // network?: WalletAdapterNetwork;
//   timeout?: number;
// }

// export class NightlyWalletAdapter extends BaseWalletAdapter {
//   name = NightlyWalletName;

//   url =
//     'https://chrome.google.com/webstore/detail/nightly/injggoambcadlfkkjcgdfbejanmgfgfm/related?hl=en&authuser=0';

//   icon =
//     'https://lh3.googleusercontent.com/Ha38j09tA-70EiZ17pculpj1KUKDP07ytX4DJx_fumDfod_X2nRTiUg2Y9tDwRBs5jDj-gu52hwaPYVPgq1xAuFA1Q=w128-h128-e365-rj-sc0x00ffffff';

//   protected _provider: INightlyWallet | undefined;

//   // protected _network: WalletAdapterNetwork;
//   protected _timeout: number;

//   protected _readyState: WalletReadyState =
//     typeof window === 'undefined' || typeof document === 'undefined'
//       ? WalletReadyState.Unsupported
//       : WalletReadyState.NotDetected;

//   protected _connecting: boolean;

//   protected _wallet: {
//     publicKey?: string;
//     address?: string;
//     authKey?: string;
//     isConnected: boolean;
//   } | null;

//   constructor({
//     // provider,
//     // network = WalletAdapterNetwork.Mainnet,
//     timeout = 10000
//   }: NightlyWalletAdapterConfig = {}) {
//     super();

//     this._provider = window.nightly?.aptos;
//     // this._network = network;
//     this._timeout = timeout;
//     this._connecting = false;
//     this._wallet = null;

//     if (this._readyState !== WalletReadyState.Unsupported) {
//       scopePollingDetectionStrategy(() => {
//         if (window.nightly?.aptos) {
//           this._readyState = WalletReadyState.Installed;
//           this.emit('readyStateChange', this._readyState);
//           return true;
//         }
//         return false;
//       });
//     }
//   }

//   get publicAccount(): AccountKeys {
//     return {
//       publicKey: this._wallet?.publicKey || null,
//       address: this._wallet?.address || null,
//       authKey: this._wallet?.authKey || null
//     };
//   }

//   get connecting(): boolean {
//     return this._connecting;
//   }

//   get connected(): boolean {
//     return !!this._wallet?.isConnected;
//   }

//   get readyState(): WalletReadyState {
//     return this._readyState;
//   }

//   async connect(): Promise<void> {
//     try {
//       if (this.connected || this.connecting) return;
//       if (
//         !(
//           this._readyState === WalletReadyState.Loadable ||
//           this._readyState === WalletReadyState.Installed
//         )
//       )
//         throw new WalletNotReadyError();
//       this._connecting = true;

//       const provider = this._provider || window.nightly?.aptos;
//       const publicKey = await provider?.connect(() => {
//         console.log('Trigger disconnect Aptos');
//       });
//       this._wallet = {
//         publicKey: publicKey?.asString(),
//         address: publicKey?.address(),
//         isConnected: true
//       };

//       this.emit('connect', this._wallet.publicKey || '');
//     } catch (error: any) {
//       this.emit('error', error);
//       throw error;
//     } finally {
//       this._connecting = false;
//     }
//   }

//   async disconnect(): Promise<void> {
//     const wallet = this._wallet;
//     if (wallet) {
//       this._wallet = null;

//       try {
//         const provider = this._provider || window.nightly?.aptos;
//         await provider?.disconnect();
//       } catch (error: any) {
//         this.emit('error', new WalletDisconnectionError(error?.message, error));
//       }
//     }

//     this.emit('disconnect');
//   }

//   async signTransaction(transaction: TransactionPayload): Promise<SubmitTransactionRequest> {
//     try {
//       const wallet = this._wallet;
//       if (!wallet) throw new WalletNotConnectedError();

//       try {
//         const provider = this._provider || window.nightly?.aptos;
//         const response = await provider?.signTransaction(transaction);
//         if (response) {
//           return response;
//         } else {
//           throw new Error('Transaction failed');
//         }
//       } catch (error: any) {
//         throw new WalletSignTransactionError(error?.message, error);
//       }
//     } catch (error: any) {
//       this.emit('error', error);
//       throw error;
//     }
//   }

//   async signAndSubmitTransaction(tempTransaction: TransactionPayload): Promise<PendingTransaction> {
//     try {
//       const wallet = this._wallet;
//       if (!wallet) throw new WalletNotConnectedError();

//       try {
//         const provider = this._provider || window.nightly?.aptos;
//         const client = aptosClient;
//         const [{ sequence_number: sequnceNumber }, chainId] = await Promise.all([
//           client.getAccount(wallet.address || ''),
//           client.getChainId()
//         ]);
//         const transaction = tempTransaction as ScriptFunctionPayload;
//         const [txAddress, module, funcName] = transaction.function.split('::');
//         const token = new TypeTagStruct(StructTag.fromString(transaction.type_arguments[0]));
//         const argts = transaction.arguments.map((arg) => {
//           if (typeof arg === 'string') {
//             return bcsSerializeUint64(parseInt(arg));
//           } else if (typeof arg === 'boolean') {
//             const serializer = new BCS.Serializer();
//             serializer.serializeBool(arg);
//             return serializer.getBytes();
//           } else if (typeof arg === 'number') {
//             return bcsSerializeUint64(arg);
//           } else {
//             return arg;
//           }
//         });
//         console.log('txnpayload>>', transaction.arguments, argts);
//         const txnPayload = new TransactionPayloadScriptFunction(
//           ScriptFunction.natural(`${txAddress}::${module}`, funcName, [token], [...argts])
//         );

//         const rawTxn = new TxnBuilderTypes.RawTransaction(
//           TxnBuilderTypes.AccountAddress.fromHex(wallet.address || ''),
//           BigInt(sequnceNumber),
//           txnPayload,
//           BigInt(1000),
//           BigInt(1),
//           BigInt(Math.floor(Date.now() / 1000) + 10),
//           new TxnBuilderTypes.ChainId(chainId)
//         );
//         const bcsTxn = await provider?.signTransaction(rawTxn);
//         const response = await aptosClient.submitSignedBCSTransaction(bcsTxn);
//         if (response) {
//           console.log('tx response>>>', response);
//           return response;
//         } else {
//           throw new Error('Transaction failed');
//         }
//       } catch (error: any) {
//         const errMsg = error instanceof Error ? error.message : error.response.data.message;
//         throw new WalletSignTransactionError(errMsg);
//       }
//     } catch (error: any) {
//       this.emit('error', error);
//       throw error;
//     }
//   }
// }

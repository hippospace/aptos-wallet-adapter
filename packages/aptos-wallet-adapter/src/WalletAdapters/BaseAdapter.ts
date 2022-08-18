import { payloadArg, U128, U64, U8 } from '@manahippo/move-to-ts';
import { BCS, MaybeHexString, TxnBuilderTypes } from 'aptos';
import {
  SubmitTransactionRequest,
  HexEncodedBytes,
  TransactionPayload_EntryFunctionPayload
} from 'aptos/dist/generated';
import { TransactionPayloadEntryFunction } from 'aptos/dist/transaction_builder/aptos_types';
import { Bytes, Seq, Serializer } from 'aptos/dist/transaction_builder/bcs';
import EventEmitter from 'eventemitter3';

declare global {
  interface Window {
    hippo: any;
  }
}

interface Serializable {
  serialize(serializer: Serializer): void;
}

type RawArgument = U8 | U64 | U128 | boolean | string | Serializable | Uint8Array;

export class TransactionEntryFunctionPayloadOfRawArguments {
  constructor(
    public payload: Omit<TransactionPayload_EntryFunctionPayload, 'arguments'> & {
      arguments: RawArgument[];
    }
  ) {
    if (!/^0x[0-9a-f]+::[\w\d_-]+::[\w\d_-]+$/.test(this.payload.function)) {
      throw new Error('Incorrect function argument');
    }
  }

  toJSONPayload(): TransactionPayload_EntryFunctionPayload {
    return {
      type: 'script_function_payload',
      function: this.payload.function,
      type_arguments: this.payload.type_arguments,
      arguments: this.payload.arguments.map((arg) => payloadArg(arg))
    };
  }

  toBCSPayload(): TransactionPayloadEntryFunction {
    const tyArgs = this.payload.type_arguments.map(
      (ta) => new TxnBuilderTypes.TypeTagStruct(TxnBuilderTypes.StructTag.fromString(ta))
    );

    const parts = this.payload.function.split('::');
    const func = parts.pop()!;
    const module = parts.join('::');
    return new TxnBuilderTypes.TransactionPayloadEntryFunction(
      TxnBuilderTypes.EntryFunction.natural(
        module,
        func,
        tyArgs,
        TransactionEntryFunctionPayloadOfRawArguments.rawArgumentsToBytesSeq(this.payload.arguments)
      )
    );
  }

  static rawArgumentsToBytesSeq(rawArguments: RawArgument[]): Seq<Bytes> {
    return rawArguments.map((ra) => {
      if (ra instanceof U8) {
        return BCS.bcsSerializeU8(ra.toJsNumber());
      } else if (ra instanceof U64) {
        return BCS.bcsSerializeUint64(ra.toBigInt());
      } else if (ra instanceof U128) {
        return BCS.bcsSerializeU128(ra.toBigInt());
      } else if (typeof ra === 'boolean') {
        return BCS.bcsSerializeBool(ra);
      } else if (typeof ra === 'string') {
        return BCS.bcsSerializeStr(ra);
      } else if (ra instanceof Uint8Array) {
        // support serialize beforehand
        return ra;
      } else if (typeof (ra as Serializable).serialize === 'function') {
        return BCS.bcsToBytes(ra as Serializable);
      } else {
        throw new Error(`Invalid raw argument: ${ra}`);
      }
    });
  }
}

export type TransactionPayloadScriptFunctionGeneric =
  | TransactionPayload_EntryFunctionPayload
  | TransactionPayloadEntryFunction
  | TransactionEntryFunctionPayloadOfRawArguments;

export { EventEmitter };

export type PublicKey = MaybeHexString;
export type Address = MaybeHexString;
export type AuthKey = MaybeHexString;

export interface AccountKeys {
  publicKey: PublicKey | null;
  address: Address | null;
  authKey: AuthKey | null;
}

export interface WalletAdapterEvents {
  connect(publicKey: PublicKey): void;
  disconnect(): void;
  error(error: any): void;
  success(value: any): void;
  readyStateChange(readyState: WalletReadyState): void;
}

export enum WalletReadyState {
  /**
   * User-installable wallets can typically be detected by scanning for an API
   * that they've injected into the global context. If such an API is present,
   * we consider the wallet to have been installed.
   */
  Installed = 'Installed',
  NotDetected = 'NotDetected',
  /**
   * Loadable wallets are always available to you. Since you can load them at
   * any time, it's meaningless to say that they have been detected.
   */
  Loadable = 'Loadable',
  /**
   * If a wallet is not supported on a given platform (eg. server-rendering, or
   * mobile) then it will stay in the `Unsupported` state.
   */
  Unsupported = 'Unsupported'
}

export type WalletName<T extends string = string> = T & { __brand__: 'WalletName' };

export interface WalletAdapterProps<Name extends string = string> {
  name: WalletName<Name>;
  url: string;
  icon: string;
  readyState: WalletReadyState;
  connecting: boolean;
  connected: boolean;
  publicAccount: AccountKeys;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signAndSubmitTransaction(
    payload: TransactionPayloadScriptFunctionGeneric
  ): Promise<{ hash: HexEncodedBytes }>;
  signTransaction(
    payload: TransactionPayloadScriptFunctionGeneric
  ): Promise<SubmitTransactionRequest>;
}

export type WalletAdapter<Name extends string = string> = WalletAdapterProps<Name> &
  EventEmitter<WalletAdapterEvents>;

export abstract class BaseWalletAdapter
  extends EventEmitter<WalletAdapterEvents>
  implements WalletAdapter
{
  abstract name: WalletName;

  abstract url: string;

  abstract icon: string;

  abstract get readyState(): WalletReadyState;

  abstract get publicAccount(): AccountKeys;

  abstract get connecting(): boolean;

  get connected(): boolean {
    return !!this.publicAccount.publicKey;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract signAndSubmitTransaction(
    transaction: TransactionPayloadScriptFunctionGeneric
  ): Promise<{ hash: HexEncodedBytes }>;

  abstract signTransaction(
    transaction: TransactionPayloadScriptFunctionGeneric
  ): Promise<SubmitTransactionRequest>;
}

export function scopePollingDetectionStrategy(detect: () => boolean): void {
  // Early return when server-side rendering
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const disposers: (() => void)[] = [];

  function detectAndDispose() {
    const detected = detect();
    if (detected) {
      for (const dispose of disposers) {
        dispose();
      }
    }
  }

  // Strategy #1: Try detecting every second.
  const interval =
    // TODO: #334 Replace with idle callback strategy.
    setInterval(detectAndDispose, 1000);
  disposers.push(() => clearInterval(interval));

  // Strategy #2: Detect as soon as the DOM becomes 'ready'/'interactive'.
  if (
    // Implies that `DOMContentLoaded` has not yet fired.
    document.readyState === 'loading'
  ) {
    document.addEventListener('DOMContentLoaded', detectAndDispose, { once: true });
    disposers.push(() => document.removeEventListener('DOMContentLoaded', detectAndDispose));
  }

  // Strategy #3: Detect after the `window` has fully loaded.
  if (
    // If the `complete` state has been reached, we're too late.
    document.readyState !== 'complete'
  ) {
    window.addEventListener('load', detectAndDispose, { once: true });
    disposers.push(() => window.removeEventListener('load', detectAndDispose));
  }

  // Strategy #4: Detect synchronously, now.
  detectAndDispose();
}

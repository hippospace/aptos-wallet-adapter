import { AptosAccount } from 'aptos';
import { Buffer } from 'buffer';
import {
  ENCRYPTED_WALLET_LIST,
  WALLET_STATE_NETWORK_LOCAL_STORAGE_KEY
} from 'config/aptosConstants';
import { ActiveAptosWallet, AptosWalletObject } from 'types/aptos';

export function createNewAccount(): AptosAccount {
  const account = new AptosAccount();
  // todo: make request to create account on chain
  return account;
}

export function importAccount(key: string): AptosAccount {
  try {
    const nonHexKey = key.startsWith('0x') ? key.substring(2) : key;
    const encodedKey = Uint8Array.from(Buffer.from(nonHexKey, 'hex'));
    const account = new AptosAccount(encodedKey, undefined);
    return account;
  } catch (error) {
    throw error;
  }
}

export function getEncryptedLocalState(): string | null {
  const item = window.localStorage.getItem(ENCRYPTED_WALLET_LIST);
  return item;
}

export function getAptosAccountState(
  activeWalletObj: AptosWalletObject
): ActiveAptosWallet | undefined {
  return activeWalletObj
    ? {
        ...activeWalletObj,
        aptosAccount: AptosAccount.fromAptosAccountObject(activeWalletObj.aptosAccountObj)
      }
    : undefined;
}

export type AptosNetwork = 'http://0.0.0.0:8080' | 'https://fullnode.devnet.aptoslabs.com';

export function getLocalStorageNetworkState(): AptosNetwork | null {
  // Get network from local storage by key
  return window.localStorage.getItem(WALLET_STATE_NETWORK_LOCAL_STORAGE_KEY) as AptosNetwork | null;
}

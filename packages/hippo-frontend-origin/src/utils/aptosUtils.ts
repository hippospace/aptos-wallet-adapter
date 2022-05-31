/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AptosAccount } from 'aptos';
import {
  ACTIVE_WALLET,
  DECRYPTED_WALLET_LIST,
  // KEY_LENGTH,
  ENCRYPTED_WALLET_LIST,
  WALLET_STATE_NETWORK_LOCAL_STORAGE_KEY
} from 'config/aptosConstants';
// import CryptoJS from 'crypto-js';
import { ActiveAptosWallet, DecrypyedAptosWallet } from 'types/aptos';

// export function loginAccount(key: string): Result<AptosAccount, Error> {
//   if (key.length === KEY_LENGTH) {
//     try {
//       const encodedKey = Uint8Array.from(Buffer.from(key, 'hex'));
//       // todo: Ping API to check if a legit account
//       const account = new AptosAccount(encodedKey, undefined);
//       return ok(account);
//     } catch (e) {
//       return err(e as Error);
//     }
//   } else {
//     return err(new Error('Key not the correct the length'));
//   }
// }

export function createNewAccount(): AptosAccount {
  const account = new AptosAccount();
  // todo: make request to create account on chain
  return account;
}

// export const connectAccount = (password: string): DecryptedStorageState | null => {
//   const encryptedWallets = getEncryptedLocalState();
//   if (encryptedWallets) {
//     const item = CryptoJS.AES.decrypt(encryptedWallets, password);
//     if (item) {
//       const accountObject: AptosAccountObject = JSON.parse(item.toString(CryptoJS.enc.Utf8));
//       window.localStorage.setItem(
//         DECRYPTED_WALLET_LIST,
//         JSON.stringify(accountObject)
//       );
//       return { aptosAccountObject: accountObject };
//     }
//   }
//   return null;
// };

export const getActiveWallet = (): ActiveAptosWallet | undefined => {
  const item = window.localStorage.getItem(ACTIVE_WALLET);
  if (item) {
    const activeWalletObj: DecrypyedAptosWallet = JSON.parse(item);
    return activeWalletObj
      ? {
          ...activeWalletObj,
          aptosAccount: AptosAccount.fromAptosAccountObject(activeWalletObj.aptosAccountObj)
        }
      : undefined;
  }
  return undefined;
};

export const getDecryptedWalletList = (): DecrypyedAptosWallet[] | null => {
  const item = window.localStorage.getItem(DECRYPTED_WALLET_LIST);
  if (item) {
    const walletList: DecrypyedAptosWallet[] = JSON.parse(item);
    return walletList;
  }
  return null;
};

export function getEncryptedLocalState(): string | null {
  const item = window.localStorage.getItem(ENCRYPTED_WALLET_LIST);
  return item;
}

// export function getAptosAccountState(): ActiveAptosWallet | undefined {
//   let activeWalletObj = getDecryptedActiveWallet();
//   return activeWalletObj
//     ? {
//         ...activeWalletObj,
//         aptosAccount: AptosAccount.fromAptosAccountObject(activeWalletObj.aptosAccountObj)
//       }
//     : undefined;
// }

export type AptosNetwork = 'http://0.0.0.0:8080' | 'https://fullnode.devnet.aptoslabs.com';

export function getLocalStorageNetworkState(): AptosNetwork | null {
  // Get network from local storage by key
  return window.localStorage.getItem(WALLET_STATE_NETWORK_LOCAL_STORAGE_KEY) as AptosNetwork | null;
}

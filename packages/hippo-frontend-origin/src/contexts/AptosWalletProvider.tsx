/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, FC, ReactNode, useCallback, useState } from 'react';
import { AptosAccountState, ActiveAptosWallet, DecrypyedAptosWallet } from 'types/aptos';
import {
  ACTIVE_WALLET,
  DECRYPTED_WALLET_LIST,
  // DECRYPTED_WALLET_LIST,
  ENCRYPTED_WALLET_LIST,
  WALLET_STATE_NETWORK_LOCAL_STORAGE_KEY
} from 'config/aptosConstants';
import {
  AptosNetwork,
  getActiveWallet,
  // connectAccount,
  getDecryptedWalletList,
  getEncryptedLocalState,
  getLocalStorageNetworkState
} from 'utils/aptosUtils';
import CryptoJS from 'crypto-js';

interface AptosWalletContextType {
  activeWallet?: ActiveAptosWallet;
  aptosNetwork: AptosNetwork | null;
  disconnect: () => void;
  updateNetworkState: (network: AptosNetwork) => void;
  // updateWalletState: (props: UpdateWalletStateProps) => void;
  initialized: boolean;
  storeEncryptedWallet: (props: StoreWalletStateProp) => void;
  walletList: DecrypyedAptosWallet[];
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
  connectAccount: (password: string, wallet?: string) => void;
}

interface TProviderProps {
  children: ReactNode;
}

const defaultValue: DecrypyedAptosWallet[] = [];

const AptosWalletContext = createContext<AptosWalletContextType>({} as AptosWalletContextType);

interface UpdateWalletStateProps {
  aptosAccountState: AptosAccountState;
  walletName: string;
}

interface StoreWalletStateProp extends UpdateWalletStateProps {
  password: string;
}

const AptosWalletProvider: FC<TProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [initialized] = useState(() => !!getEncryptedLocalState());
  const [walletList, setWalletList] = useState<DecrypyedAptosWallet[]>(
    () => getDecryptedWalletList() ?? defaultValue
  );
  const [activeWallet, setActiveWallet] = useState<ActiveAptosWallet | undefined>(() =>
    getActiveWallet()
  );
  const [aptosNetwork, setAptosNetwork] = useState<AptosNetwork | null>(() =>
    getLocalStorageNetworkState()
  );

  const storeEncryptedWallet = useCallback(
    ({ aptosAccountState, walletName, password }: StoreWalletStateProp) => {
      try {
        const privateKeyObject = aptosAccountState?.toPrivateKeyObject();
        const currentWallet = { walletName, aptosAccountObj: privateKeyObject };
        const encryptedWallet = CryptoJS.AES.encrypt(
          JSON.stringify([currentWallet, ...walletList]),
          password
        ).toString();
        // window.localStorage.setItem(ACTIVE_WALLET, JSON.stringify(currentWallet));
        window.localStorage.setItem(ENCRYPTED_WALLET_LIST, encryptedWallet);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    },
    [walletList]
  );

  const updateNetworkState = useCallback((network: AptosNetwork) => {
    try {
      setAptosNetwork(network);
      window.localStorage.setItem(WALLET_STATE_NETWORK_LOCAL_STORAGE_KEY, network);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }, []);

  const connectAccount = useCallback((password: string, walletName?: string) => {
    const currentWallet = getActiveWallet();
    if (!password) throw new Error('password is missing');
    if (!currentWallet) {
      const encryptedWalletList = getEncryptedLocalState();
      if (!encryptedWalletList) throw new Error('wallet is not yet initialized');
      let decryptedWalletList: DecrypyedAptosWallet[];
      try {
        const item = CryptoJS.AES.decrypt(encryptedWalletList, password);
        decryptedWalletList = JSON.parse(item.toString(CryptoJS.enc.Utf8));
      } catch (error) {
        throw new Error('Incorrect password');
      }
      setWalletList(decryptedWalletList);
      window.localStorage.setItem(DECRYPTED_WALLET_LIST, JSON.stringify(decryptedWalletList));
      let selectedWallet: DecrypyedAptosWallet | undefined = decryptedWalletList[0];
      if (walletName) {
        selectedWallet = decryptedWalletList.find((wallet) => wallet.walletName === walletName);
      }
      if (!selectedWallet) throw new Error('Wallet not found');
      window.localStorage.setItem(ACTIVE_WALLET, JSON.stringify(selectedWallet));
      const activeAptosWallet = getActiveWallet();
      if (!activeAptosWallet) throw new Error('Wallet not found in localStorage');
      setActiveWallet(activeAptosWallet);
    } else {
      setActiveWallet(currentWallet);
    }
  }, []);

  const disconnect = useCallback(() => {
    // setAptosAccount(undefined);
    setActiveWallet(undefined);
    // setLocalStorageState({ aptosAccountObject: undefined });
    window.localStorage.removeItem(ACTIVE_WALLET);
  }, []);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  // const toggleModal = useCallback((isOpen: boolean) => setOpen(isOpen), []);

  return (
    <AptosWalletContext.Provider
      value={{
        activeWallet,
        aptosNetwork,
        disconnect,
        updateNetworkState,
        walletList,
        // updateWalletState,
        storeEncryptedWallet,
        // walletState: localStorageState,
        open,
        openModal,
        closeModal,
        connectAccount,
        initialized
      }}>
      {children}
    </AptosWalletContext.Provider>
  );
};

export { AptosWalletProvider, AptosWalletContext };

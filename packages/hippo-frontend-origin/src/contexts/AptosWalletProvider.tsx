import { createContext, FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ActiveAptosWallet, AptosWalletObject } from 'types/aptos';
import {
  CONNECT_PASSWORD,
  ENCRYPTED_WALLET_LIST,
  WALLET_STATE_NETWORK_LOCAL_STORAGE_KEY
} from 'config/aptosConstants';
import {
  AptosNetwork,
  getAptosAccountState,
  getEncryptedLocalState,
  getLocalStorageNetworkState
} from 'utils/aptosUtils';
import CryptoJS from 'crypto-js';
import { hippoWalletClient } from 'config/hippoWalletClient';

interface AptosWalletContextType {
  activeWallet?: ActiveAptosWallet;
  aptosNetwork: AptosNetwork | null;
  disconnect: () => void;
  updateNetworkState: (network: AptosNetwork) => void;
  initialized: boolean;
  storeEncryptedWallet: (props: StoreWalletStateProp) => void;
  walletList: AptosWalletObject[];
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
  connectAccount: (password: string, wallet?: string) => void;
  setActiveAptosWallet: (walletName?: string) => void;
}

interface TProviderProps {
  children: ReactNode;
}

const AptosWalletContext = createContext<AptosWalletContextType>({} as AptosWalletContextType);

interface StoreWalletStateProp {
  updatedWalletList: AptosWalletObject[];
  password?: string;
}

const AptosWalletProvider: FC<TProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [initialized] = useState(() => !!getEncryptedLocalState());
  const [walletList, setWalletList] = useState<AptosWalletObject[]>([]);
  const [activeWallet, setActiveWallet] = useState<ActiveAptosWallet | undefined>(undefined);
  const [aptosNetwork, setAptosNetwork] = useState<AptosNetwork | null>(() =>
    getLocalStorageNetworkState()
  );
  const savedPassword = window.localStorage.getItem(CONNECT_PASSWORD);
  const hippoWallet = useMemo(() => {
    if (activeWallet) {
      return hippoWalletClient(activeWallet.aptosAccount);
    }
  }, [activeWallet]);

  console.log('MEMEM>>', hippoWallet);

  useEffect(() => {
    if (walletList && walletList.length) {
      const aptosWalletState = getAptosAccountState(walletList[walletList.length - 1]);
      setActiveWallet(aptosWalletState);
    }
  }, [walletList]);

  const connectAccount = useCallback((password: string) => {
    if (!password) throw new Error('password is missing');
    const encryptedWalletList = getEncryptedLocalState();
    if (!encryptedWalletList) throw new Error('wallet is not yet initialized');
    let decryptedWalletList: AptosWalletObject[];
    try {
      const item = CryptoJS.AES.decrypt(encryptedWalletList, password);
      decryptedWalletList = JSON.parse(item.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      throw new Error('Incorrect password');
    }
    setWalletList(decryptedWalletList);
    const aptosWalletState = getAptosAccountState(decryptedWalletList[0]);
    setActiveWallet(aptosWalletState);
    // TODO: better no saving password in local storage
    window.localStorage.setItem(CONNECT_PASSWORD, password);
  }, []);

  useEffect(() => {
    if (savedPassword) {
      connectAccount(savedPassword);
    }
  }, [savedPassword]);

  const storeEncryptedWallet = useCallback(
    ({ updatedWalletList, password }: StoreWalletStateProp) => {
      const encryptPassword = password || window.localStorage.getItem(CONNECT_PASSWORD) || '';
      try {
        const encryptedWallet = CryptoJS.AES.encrypt(
          JSON.stringify(updatedWalletList),
          encryptPassword
        ).toString();
        window.localStorage.setItem(ENCRYPTED_WALLET_LIST, encryptedWallet);
        setWalletList(updatedWalletList);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    },
    []
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

  const setActiveAptosWallet = useCallback(
    (walletName?: string) => {
      if (!walletList || !walletList.length) throw new Error('Please login first');
      let selectedWallet: AptosWalletObject | undefined = walletList[0];
      if (walletName) {
        selectedWallet = walletList.find((wallet) => wallet.walletName === walletName);
      }
      if (!selectedWallet) throw new Error('Wallet not found');
      const activeAptosWallet = getAptosAccountState(selectedWallet);
      setActiveWallet(activeAptosWallet);
    },
    [setActiveWallet, walletList]
  );

  const disconnect = useCallback(() => {
    setActiveWallet(undefined);
    setWalletList([]);
    window.localStorage.removeItem(CONNECT_PASSWORD);
  }, []);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  return (
    <AptosWalletContext.Provider
      value={{
        activeWallet,
        setActiveAptosWallet,
        aptosNetwork,
        disconnect,
        updateNetworkState,
        walletList,
        storeEncryptedWallet,
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

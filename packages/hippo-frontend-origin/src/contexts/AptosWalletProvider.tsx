/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HexString } from 'aptos';
import { useWallet } from 'components/WalletAdapter/useWallet';
import { WEBWALLET_URL } from 'config/aptosConstants';
import { useLocalStorage } from 'hooks/useLocalStorage';
import { createContext, FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { ActiveAptosWallet } from 'types/aptos';

interface AptosWalletContextType {
  activeWallet?: ActiveAptosWallet;
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

interface TProviderProps {
  children: ReactNode;
}

const AptosWalletContext = createContext<AptosWalletContextType>({} as AptosWalletContextType);

const AptosWalletProvider: FC<TProviderProps> = ({ children }) => {
  const { useLocalStorageState } = useLocalStorage();
  const { connected, publicKey } = useWallet();
  const [activeWallet, setActiveWallet] = useState<ActiveAptosWallet>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      setActiveWallet(HexString.ensure(publicKey));
    } else {
      setActiveWallet(undefined);
    }
  }, [connected, publicKey]);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  return (
    <AptosWalletContext.Provider
      value={{
        activeWallet,
        open,
        openModal,
        closeModal
      }}>
      {children}
    </AptosWalletContext.Provider>
  );
};

export { AptosWalletProvider, AptosWalletContext };

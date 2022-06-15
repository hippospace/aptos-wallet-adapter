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
  const [activeWallet, setActiveWallet] = useLocalStorageState<ActiveAptosWallet>(
    'hippoActiveWallet',
    undefined,
    true
  );
  const [open, setOpen] = useState(false);

  const messageHandler = useCallback(
    (event: MessageEvent<any>) => {
      if (event.origin !== WEBWALLET_URL) return;
      const { method, address } = event.data;
      if (method === 'account') {
        setActiveWallet(address?.hexString ? address?.hexString : null);
      }
      return true;
    },
    [setActiveWallet]
  );

  useEffect(() => {
    window.addEventListener('message', messageHandler, false);
    return () => window.removeEventListener('message', messageHandler);
  }, []);

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

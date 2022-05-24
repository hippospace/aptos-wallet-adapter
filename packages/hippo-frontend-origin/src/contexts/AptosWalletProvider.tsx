import { createContext, FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Types, AptosClient } from 'aptos';
import { stringToHex } from 'utils/utility';

interface AptosWalletContextType {
  address: string | null;
  account: Types.Account | null;
  createTransaction?: (props: TTransactionProps) => TransactionType;
  signAndSubmitTransaction?: (props: TransactionType) => {};
  getResource?: (props: TGetResourceProps) => Types.AccountResource[];
}

interface TProviderProps {
  connectUri: string;
  children: ReactNode;
}

interface TTransactionProps {
  message: string;
  func: string;
}

interface TransactionType {
  type: string;
  function: string;
  arguments: string[];
  type_arguments: [];
}

interface TGetResourceProps {
  resourceType: string;
}

declare global {
  interface Window {
    aptos: any;
  }
}

const AptosWalletContext = createContext<AptosWalletContextType>({
  address: '',
  account: null
});

const AptosWalletProvider: FC<TProviderProps> = ({ connectUri, children }) => {
  const client = useMemo(() => new AptosClient(connectUri), [connectUri]);
  const [address, setAddress] = useState<string | null>(null);
  const [account, setAccount] = useState<Types.Account | null>(null);
  const [resources, setResources] = useState<Types.AccountResource[]>([]);

  useEffect(() => {
    window.aptos.account().then(setAddress);
  }, []);

  useEffect(() => {
    if (!address) return;
    client.getAccount(address).then(setAccount);
  }, [address, client]);

  useEffect(() => {
    if (!address) return;
    client.getAccountResources(address).then(setResources);
  }, [address, client]);

  const createTransaction = useCallback(
    ({ message, func }: TTransactionProps): TransactionType => {
      return {
        type: 'script_function_payload',
        function: `${address}::${func}`,
        arguments: [stringToHex(message)],
        type_arguments: []
      };
    },
    [address]
  );

  const signAndSubmitTransaction = useCallback(async (transaction: TransactionType) => {
    await window.aptos.signAndSubmitTransaction(transaction);
  }, []);

  const getResource = useCallback(
    ({ resourceType }: TGetResourceProps) => {
      const filteredResources = resources.filter((r) => r.type === resourceType);
      return filteredResources;
    },
    [resources]
  );

  return (
    <AptosWalletContext.Provider
      value={{ address, account, createTransaction, signAndSubmitTransaction, getResource }}>
      {children}
    </AptosWalletContext.Provider>
  );
};

export { AptosWalletProvider, AptosWalletContext };

import { UserTransactionRequest } from 'aptos/dist/api/data-contracts';

export type TTransaction = {
  // type: 'signTransaction' | 'signAndSubmit';
  transaction: UserTransactionRequest;
  callback: () => void;
  // transactionInfo: Record<string, string | number>;
};

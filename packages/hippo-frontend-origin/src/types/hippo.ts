import { UserTransactionRequest } from 'aptos/dist/api/data-contracts';

export type TTransaction = {
  // type: 'swap' | 'deposit' | 'withdraw';
  transaction: UserTransactionRequest;
  callback: () => void;
  // transactionInfo: Record<string, string | number>;
};

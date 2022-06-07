import { TransactionPayload } from 'aptos/dist/api/data-contracts';

export type TTransaction = {
  type: 'swap' | 'deposit' | 'withdraw';
  payload: TransactionPayload;
  callback: (trans: TTransaction) => void;
  transactionInfo: Record<string, string | number>;
};

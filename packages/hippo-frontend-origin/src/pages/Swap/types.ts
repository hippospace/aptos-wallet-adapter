import { ITokenInfo } from 'types/tokenList';

export interface ISwapSettings {
  slipTolerance: number;
  trasactionDeadline: number;
  currencyFrom?: {
    token: ITokenInfo;
    amount: number;
    balance: number;
  };
  currencyTo?: {
    token: ITokenInfo;
    amount: number;
    balance: number;
  };
}

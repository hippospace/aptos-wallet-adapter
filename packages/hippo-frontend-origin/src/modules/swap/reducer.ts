import { createReducer } from '@reduxjs/toolkit';
import { RootState } from 'modules/rootReducer';
import { ISwapSettings } from 'pages/Swap/types';
import { ITokenInfo } from 'types/tokenList';
import actions from './actions';

interface SwapState {
  isFetching: boolean;
  isFetched: boolean;
  error: any;
  tokenList: ITokenInfo[];
  swapSettings: ISwapSettings;
}

const initState: SwapState = {
  isFetching: false,
  isFetched: false,
  error: null,
  tokenList: [],
  swapSettings: {
    slipTolerance: 1,
    trasactionDeadline: 0,
    currencyFrom: {
      token: {} as ITokenInfo,
      amount: undefined,
      balance: 0
    },
    currencyTo: {
      token: {} as ITokenInfo,
      amount: undefined,
      balance: 0
    }
  }
};

export default createReducer(initState, (builder) => {
  builder
    .addCase(actions.SET_IS_FETCHING, (state, { payload }) => {
      state.isFetching = payload;
      state.isFetched = false;
    })
    .addCase(actions.SET_TOKEN_LIST, (state, { payload }) => {
      state.tokenList = payload;
      state.isFetching = false;
      state.isFetched = true;
    })
    .addCase(actions.SET_SWAP_SETTING, (state, { payload }) => {
      state.swapSettings = payload;
    });
});

export const getIsFetchingTokenList = (state: RootState) => state.swap.isFetching;
export const getIsFetchedTokenList = (state: RootState) => state.swap.isFetched;
export const getTokenList = (state: RootState) => state.swap.tokenList;
export const getSwapSettings = (state: RootState) => state.swap.swapSettings;

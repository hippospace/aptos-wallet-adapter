import { createAction } from '@reduxjs/toolkit';
import { ISwapSettings } from 'pages/Swap/types';
import { ITokenInfo } from 'types/tokenList';

const SET_IS_FETCHING = createAction<boolean>('swap/SET_IS_FETCHING');
const SET_TOKEN_LIST = createAction<ITokenInfo[]>('swap/SET_TOKEN_LIST');
const SET_SWAP_SETTING = createAction<ISwapSettings>('swap/SET_SWAP_SETTING');

export default {
  SET_IS_FETCHING,
  SET_TOKEN_LIST,
  SET_SWAP_SETTING
};

import { combineReducers } from '@reduxjs/toolkit';
import account from './account';
import common from './common';
import pool from './pool';
import swap from './swap';

const rootReducer = combineReducers({
  account: account.reducer,
  swap: swap.reducer,
  pool: pool.reducer,
  common: common.reducer
});
export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;

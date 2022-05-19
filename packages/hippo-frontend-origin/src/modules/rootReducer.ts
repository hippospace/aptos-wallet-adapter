import account from './account';

import { combineReducers } from '@reduxjs/toolkit';

const rootReducer = combineReducers({
  account: account.reducer
});
export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;

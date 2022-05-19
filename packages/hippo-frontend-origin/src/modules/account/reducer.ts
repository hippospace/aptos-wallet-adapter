import { createReducer } from '@reduxjs/toolkit';
import { RootState } from 'modules/rootReducer';
import actions from './actions';

interface AccountState {
  selectedAccount: null | { address: string };
}

const initState: AccountState = {
  selectedAccount: null
};

export default createReducer(initState, (builder) => {
  builder.addCase(actions.SET_SELECTED_ACCOUNT, (state, action) => {
    state.selectedAccount = action.payload;
  });
});

export const getSelectedAccount = (state: RootState) => state.account.selectedAccount;

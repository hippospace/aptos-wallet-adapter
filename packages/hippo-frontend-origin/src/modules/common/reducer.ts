import { createReducer } from '@reduxjs/toolkit';
import { RootState } from 'modules/rootReducer';
import actions from './actions';

interface CommonState {
  layoutHeight: number;
  showWalletConnector: boolean;
}

const initState: CommonState = {
  layoutHeight: 0,
  showWalletConnector: false
};

export default createReducer(initState, (builder) => {
  builder
    .addCase(actions.SET_LAYOUT_HEIGHT, (state, { payload }) => {
      state.layoutHeight = payload;
    })
    .addCase(actions.TOGGLE_WALLET_CONNECTOR, (state, { payload }) => {
      state.showWalletConnector = payload === undefined ? !state.showWalletConnector : payload;
    });
});

export const getLayoutHeight = (state: RootState) => state.common.layoutHeight;
export const getShowWalletConnector = (state: RootState) => state.common.showWalletConnector;

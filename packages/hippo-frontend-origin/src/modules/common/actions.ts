import { createAction } from '@reduxjs/toolkit';

const SET_LAYOUT_HEIGHT = createAction<number>('pool/SET_LAYOUT_HEIGHT');
const TOGGLE_WALLET_CONNECTOR = createAction<boolean>('common/TOGGLE_WALLET_CONNECTOR');

export default {
  SET_LAYOUT_HEIGHT,
  TOGGLE_WALLET_CONNECTOR
};

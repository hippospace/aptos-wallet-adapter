import { createAction } from '@reduxjs/toolkit';

const SET_SELECTED_ACCOUNT = createAction<{ address: string }>('account/SET_SELECTED_ACCOUNT');

export default {
  SET_SELECTED_ACCOUNT
};

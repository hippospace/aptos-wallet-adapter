import { createAction } from '@reduxjs/toolkit';
import { IPool, IPoolFilters } from 'types/pool';

const SET_IS_FETCHING = createAction<boolean>('pool/SET_IS_FETCHING');
const SET_POOL_LIST = createAction<IPool[]>('pool/SET_POOL_LIST');
const SET_FILTERS = createAction<IPoolFilters>('pool/SET_FILTERS');

export default {
  SET_IS_FETCHING,
  SET_POOL_LIST,
  SET_FILTERS
};

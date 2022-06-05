import Button from 'components/Button';
import { useFormikContext } from 'formik';
import { useCallback, useEffect } from 'react';
import { SwapIcon } from 'resources/icons';
import random from 'lodash/random';
import { ISwapSettings } from '../types';
import CurrencyInput from './CurrencyInput';
import SwapDetail from './SwapDetail';

const TokenSwap = () => {
  const { values, setFieldValue } = useFormikContext<ISwapSettings>();

  const fetchSwapPrice = useCallback(() => {
    if (
      values.currencyFrom?.amount &&
      values.currencyFrom?.token.address &&
      values.currencyTo?.token.address
    ) {
      // TO UPDATE: IMPLEMENT FETCH BEST PRICE
      setFieldValue('currencyTo', {
        ...values.currencyTo,
        amount: values.currencyFrom.amount * random(0.1, 2.1)
      });
    }
  }, [values, setFieldValue]);

  useEffect(() => {
    fetchSwapPrice();
  }, [values.currencyFrom?.amount, values.currencyFrom?.token, values.currencyTo?.token]);

  const onClickSwapToken = useCallback(() => {
    const tokenFrom = values.currencyFrom;
    const tokenTo = values.currencyTo;
    setFieldValue('currencyFrom', tokenTo);
    setFieldValue('currencyTo', tokenFrom);
  }, [values, setFieldValue]);

  return (
    <div className="w-full flex flex-col px-8 gap-1">
      <CurrencyInput actionType="currencyFrom" />
      <Button variant="outlined" className="!bg-secondary !border-0" onClick={onClickSwapToken}>
        <SwapIcon />
      </Button>
      <CurrencyInput actionType="currencyTo" />
      {!!values.currencyFrom?.amount && !!values.currencyTo?.token.symbol && <SwapDetail />}
      <Button className="paragraph bold mt-14">SWAP</Button>
    </div>
  );
};

export default TokenSwap;

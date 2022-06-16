/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Button from 'components/Button';
import { useFormikContext } from 'formik';
import { useCallback, useEffect } from 'react';
import { SwapIcon } from 'resources/icons';
import { ISwapSettings } from '../types';
import CurrencyInput from './CurrencyInput';
import SwapDetail from './SwapDetail';
import useHippoClient from 'hooks/useHippoClient';
import useAptosWallet from 'hooks/useAptosWallet';

const TokenSwap = () => {
  const { values, setFieldValue, submitForm, isSubmitting } = useFormikContext<ISwapSettings>();
  const { activeWallet, openModal } = useAptosWallet();
  const hippoClient = useHippoClient();
  const fromSymbol = values.currencyFrom?.token.symbol;
  const toSymbol = values.currencyTo?.token.symbol;
  const fromUiAmt = values.currencyFrom?.amount;

  const fetchSwapPrice = useCallback(() => {
    if (hippoClient.hippoSwap && fromSymbol && toSymbol && fromUiAmt) {
      const quote = hippoClient.hippoSwap.getBestQuoteBySymbols(fromSymbol, toSymbol, fromUiAmt, 3);
      if (quote && quote.bestQuote.outputUiAmt !== values.currencyTo?.amount) {
        // TO UPDATE: IMPLEMENT FETCH BEST PRICE
        setFieldValue('currencyTo', {
          ...values.currencyTo,
          amount: quote.bestQuote.outputUiAmt
        });
      }
    }
  }, [values, setFieldValue, fromSymbol, fromUiAmt, hippoClient.hippoSwap, toSymbol]);

  useEffect(() => {
    fetchSwapPrice();
  }, [fetchSwapPrice]);

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
      <Button
        isLoading={isSubmitting}
        className="paragraph bold mt-14"
        // disabled={activeWallet && (!isValid || !dirty)}
        onClick={!activeWallet ? openModal : submitForm}>
        {!activeWallet ? 'Connect to Wallet' : 'SWAP'}
      </Button>
    </div>
  );
};

export default TokenSwap;

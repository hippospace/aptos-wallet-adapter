import Button from 'components/Button';
import { useFormikContext } from 'formik';
import { useCallback, useEffect } from 'react';
import { SwapIcon } from 'resources/icons';
import { ISwapSettings } from '../types';
import CurrencyInput from './CurrencyInput';
import SwapDetail from './SwapDetail';
import useHippoClient from 'hooks/useHippoClient';

const TokenSwap = () => {
  const { values, setFieldValue } = useFormikContext<ISwapSettings>();
  const hippoClient = useHippoClient();
  const fromSymbol = values.currencyFrom?.token.symbol;
  const toSymbol = values.currencyTo?.token.symbol;
  const fromUiAmt = values.currencyFrom?.amount;
  const hippoWallet = hippoClient.hippoWallet;

  const fetchSwapPrice = useCallback(() => {
    if (hippoClient.hippoSwap && fromSymbol && toSymbol && fromUiAmt) {
      const quote = hippoClient.hippoSwap.getCPQuoteBySymbols(fromSymbol, toSymbol, fromUiAmt);
      if (typeof quote === 'object') {
        // TO UPDATE: IMPLEMENT FETCH BEST PRICE
        setFieldValue('currencyTo', {
          ...values.currencyTo,
          amount: quote.outputUiAmt
        });
      }
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

  const onClickSwap = useCallback(async () => {
    if (hippoClient.hippoSwap && hippoWallet && fromSymbol && toSymbol && fromUiAmt) {
      const quote = hippoClient.hippoSwap.getCPQuoteBySymbols(fromSymbol, toSymbol, fromUiAmt);
      if (typeof quote === 'object') {
        const minOut = quote.outputUiAmt * (1 - values.slipTolerance / 100);
        await hippoClient.requestSwap(fromSymbol, toSymbol, fromUiAmt, minOut);
        await hippoWallet.refreshStores();
        // TODO: refresh the UI numbers
        // setRefresh(true);
      } else {
        // TODO: info bubble "route note available"
      }
    }
  }, [hippoClient.hippoSwap, fromSymbol, toSymbol, fromUiAmt]);

  return (
    <div className="w-full flex flex-col px-8 gap-1">
      <CurrencyInput actionType="currencyFrom" />
      <Button variant="outlined" className="!bg-secondary !border-0" onClick={onClickSwapToken}>
        <SwapIcon />
      </Button>
      <CurrencyInput actionType="currencyTo" />
      {!!values.currencyFrom?.amount && !!values.currencyTo?.token.symbol && <SwapDetail />}
      <Button className="paragraph bold mt-14" onClick={onClickSwap}>
        SWAP
      </Button>
    </div>
  );
};

export default TokenSwap;

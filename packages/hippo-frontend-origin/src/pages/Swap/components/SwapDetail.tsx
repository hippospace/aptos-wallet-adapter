import { useFormikContext } from 'formik';
import useHippoClient from 'hooks/useHippoClient';
// import { getSwapSettings } from 'modules/swap/reducer';
// import { useSelector } from 'react-redux';
import { ISwapSettings } from '../types';

const SwapDetail: React.FC = () => {
  // const swapSettings = useSelector(getSwapSettings);
  const { values: swapSettings } = useFormikContext<ISwapSettings>();
  const hippoClient = useHippoClient();
  let output = '...';
  let minimum = '...';
  let priceImpact = '...';

  // FIXME: why swapSettings never gets updated??
  console.log(swapSettings);

  if (hippoClient.hippoSwap && swapSettings.currencyFrom?.amount && swapSettings.currencyTo) {
    const fromSymbol = swapSettings.currencyFrom.token.symbol;
    const toSymbol = swapSettings.currencyTo.token.symbol;

    const hasRoute = hippoClient.hippoSwap.hasCpPoolFor(fromSymbol, toSymbol);
    const priceInfo = hippoClient.hippoSwap.getCpPriceBySymbols(fromSymbol, toSymbol);
    if (hasRoute && typeof priceInfo === 'object') {
      const yToX = priceInfo.yToX;
      const outputUiAmt = swapSettings.currencyFrom.amount * yToX;
      output = `${outputUiAmt.toFixed(4)} ${toSymbol}`;
      minimum = `${(outputUiAmt * (1 - swapSettings.slipTolerance)).toFixed(4)} ${toSymbol}`;
      priceImpact = '0.01%';
    } else {
      output = 'route unavailable';
      minimum = 'route unavailable';
      priceImpact = 'route unavailable';
    }
  }

  const details = [
    {
      label: 'Expected Output',
      value: output
    },
    {
      label: 'Minimum received after slippage',
      value: minimum
    },
    {
      label: 'Price Impact',
      value: priceImpact
    },
    {
      label: 'Slippage tolerance',
      value: `${swapSettings.slipTolerance} %`
    }
  ];

  return (
    <div className="flex flex-col gap-2 py-4 mt-6 -mb-6 px-2">
      {details.map((detail) => (
        <div className="flex justify-between" key={detail.label}>
          <small className="font-bold text-grey-900">{detail.label}</small>
          <small className="font-bold text-grey-900">{detail.value}</small>
        </div>
      ))}
    </div>
  );
};

export default SwapDetail;

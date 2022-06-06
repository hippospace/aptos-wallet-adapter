import { useFormikContext } from 'formik';
import { ISwapSettings } from 'pages/Swap/types';
import { CaretIcon } from 'resources/icons';
import cx from 'classnames';
import styles from './CurrencyInput.module.scss';
import CoinSelector from './CoinSelector';
import { useMemo, useState } from 'react';
import NumberInput from 'components/NumberInput';
import CoinIcon from 'components/CoinIcon';
import { Popover } from 'antd';
import useHippoClient from 'hooks/useHippoClient';

interface TProps {
  actionType: 'currencyTo' | 'currencyFrom';
}

const CurrencyInput: React.FC<TProps> = ({ actionType }) => {
  const [isVisibile, setIsVisible] = useState(false);
  const { values, setFieldValue } = useFormikContext<ISwapSettings>();
  const hippoClient = useHippoClient();

  const selectedCurrency = values[actionType];
  const selectedSymbol = selectedCurrency?.token.symbol;
  let uiBalance = 0;
  if (selectedSymbol && hippoClient && hippoClient.hippoWallet) {
    const selectedRawBalance =
      hippoClient.hippoWallet?.symbolToCoinStore[selectedSymbol]?.coin.value.toJSNumber();
    const selectedDecimals = hippoClient.hippoWallet.symbolToTokenInfo[selectedSymbol].decimals;
    uiBalance = selectedRawBalance! / Math.pow(10, selectedDecimals!) || 0;
  }

  const coinSelectorButton = useMemo(() => {
    return (
      <div
        className="flex items-center gap-2 font-bold cursor-pointer"
        onClick={() => setIsVisible(true)}>
        {selectedCurrency?.token.symbol ? (
          <div className="flex gap-2 uppercase items-center">
            <CoinIcon logoSrc={selectedCurrency.token.logoURI} />
            {selectedCurrency.token.symbol}
          </div>
        ) : (
          <div>Select Currency</div>
        )}
        <CaretIcon className="fill-black" />
      </div>
    );
  }, [setIsVisible, selectedCurrency]);

  return (
    <div
      className={cx(
        styles.currencyInput,
        'bg-transparent w-full py-4 px-6 border-[3px] border-grey-900 rounded-xl'
      )}>
      <div className="flex gap-1">
        <Popover
          overlayClassName={styles.popover}
          trigger="click"
          visible={isVisibile}
          onVisibleChange={(visible) => setIsVisible(visible)}
          content={
            <CoinSelector actionType={actionType} dismissiModal={() => setIsVisible(!isVisibile)} />
          }>
          {coinSelectorButton}
        </Popover>
        <NumberInput
          className="grow rounded-xl bg-transparent"
          min={0}
          placeholder="0.00"
          onFocus={() =>
            setFieldValue(actionType, {
              ...selectedCurrency,
              amount: null
            })
          }
          controls={false}
          value={selectedCurrency?.amount}
          onChange={(val) =>
            setFieldValue(actionType, {
              ...selectedCurrency,
              amount: val
            })
          }
        />
      </div>
      <div className="flex justify-between">
        <small className="flex items-center gap-2 font-bold text-grey-500">Current Balance:</small>
        <NumberInput
          className="grow bg-transparent"
          step="0.01"
          stringMode
          readOnly
          controls={false}
          formatter={(value: unknown) =>
            typeof value !== 'undefined'
              ? `${parseFloat((value as string) || '0.00').toFixed(4)}`
              : ''
          }
          value={uiBalance.toString()}
        />
      </div>
    </div>
  );
};

export default CurrencyInput;

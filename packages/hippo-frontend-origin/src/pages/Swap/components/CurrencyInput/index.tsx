import { useFormikContext } from 'formik';
import { ISwapSettings } from 'pages/Swap/types';
import { CaretIcon } from 'resources/icons';
import cx from 'classnames';
import styles from './CurrencyInput.module.scss';
import CoinSelector from './CoinSelector';
import { useMemo, useState } from 'react';
import NumberInput from 'components/NumberInput';
import CoinIcon from 'components/CoinIcon';

interface TProps {
  actionType: 'currencyTo' | 'currencyFrom';
}

const CurrencyInput: React.FC<TProps> = ({ actionType }) => {
  const [isVisibile, setIsVisible] = useState(false);
  const { values, setFieldValue } = useFormikContext<ISwapSettings>();

  const selectedCurrency = values[actionType];

  const coinSelectorButton = useMemo(() => {
    return (
      <div
        className="flex items-center gap-2 paragraph bold cursor-pointer"
        onClick={() => setIsVisible(true)}>
        {selectedCurrency?.token.symbol ? (
          <div className="flex gap-2 uppercase items-center">
            <CoinIcon logoSrc={selectedCurrency.token.logoURI} />
            {selectedCurrency.token.symbol}
          </div>
        ) : (
          <div>Select Currency</div>
        )}
        <CaretIcon />
      </div>
    );
  }, [setIsVisible, selectedCurrency]);

  return (
    <div className={cx(styles.currencyInput, 'bg-primeBlack w-full pt-5 pb-2 px-6')}>
      <div className="flex gap-1">
        {coinSelectorButton}
        <NumberInput
          className="grow rounded-[10px] bg-input"
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
        <div className="flex items-center gap-2 helpText bold text-primeBlack50">
          Current Balance:
        </div>
        <NumberInput
          className="grow rounded-[10px] bg-input"
          step="0.01"
          stringMode
          readOnly
          controls={false}
          formatter={(value: unknown) =>
            typeof value !== 'undefined'
              ? `$${parseFloat((value as string) || '0.00').toFixed(2)}`
              : ''
          }
          value={(selectedCurrency?.balance || '0') as string}
        />
      </div>
      <CoinSelector
        actionType={actionType}
        isVisible={isVisibile}
        dismissiModal={() => setIsVisible(!isVisibile)}
      />
    </div>
  );
};

export default CurrencyInput;

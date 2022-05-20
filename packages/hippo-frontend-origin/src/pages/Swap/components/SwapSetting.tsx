import { useFormikContext } from 'formik';
import { ISwapSettings } from 'pages/Swap/types';
import Button from 'components/Button';
import NumberInput from 'components/NumberInput';
import { useCallback } from 'react';
import random from 'lodash/random';
import { useDispatch } from 'react-redux';
import swapAction from 'modules/swap/actions';

interface TProps {
  onClose: () => void;
}

const SwapSetting: React.FC<TProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const { values, setFieldValue, touched, errors } = useFormikContext<ISwapSettings>();

  const handleAuto = () => {
    // TO UPDATE
    setFieldValue('slipTolerance', random(0, 100));
  };

  const onConfirm = useCallback(() => {
    dispatch(swapAction.SET_SWAP_SETTING(values));
    onClose();
  }, [onClose, values, dispatch]);

  const onResetSwapSetting = useCallback(() => {
    setFieldValue('slipTolerance', 0);
    setFieldValue('trasactionDeadline', 0);
  }, [setFieldValue]);

  return (
    <div>
      <div className="paragraph bold text-black">Transaction Settings</div>
      <div className="mt-6">
        <div className="paragraph text-primeBlack80">Slippage tolerance</div>
        <div className="flex w-full mt-4">
          <NumberInput
            className="grow mr-4 rounded-[10px] bg-input"
            name="slipTolerance"
            min={0}
            max={100}
            placeholder="0.00%"
            step="0.01"
            stringMode
            controls={false}
            parser={(value: string | undefined) =>
              Number(
                parseFloat(typeof value !== 'undefined' ? value.replace('%', '') : '').toFixed(2)
              )
            }
            formatter={(value) => (typeof value !== 'undefined' && value > 0 ? `${value}%` : '')}
            value={values.slipTolerance}
            onChange={(val) => setFieldValue('slipTolerance', val)}
          />
          <Button className="py-[6px]" onClick={handleAuto}>
            Auto
          </Button>
        </div>
      </div>
      <div className="mt-6">
        <div className="paragraph text-primeBlack80">Transaction deadline</div>
        <div className="flex w-full mt-4 h-[39px] items-center">
          <NumberInput
            className="w-[88px] h-full mr-4 rounded-[10px] bg-input"
            name="trasactionDeadline"
            min={0}
            max={4320}
            placeholder="0"
            step="1"
            stringMode
            controls={false}
            status={touched.trasactionDeadline && Boolean(errors.trasactionDeadline) ? 'error' : ''}
            value={values.trasactionDeadline}
            onChange={(val) => setFieldValue('trasactionDeadline', val)}
          />
          <div className="paragraph">minutes</div>
        </div>
      </div>
      <div className="mt-6 flex gap-6">
        <Button
          className="border-2 border-primary grow paragraph active:!bg-primeBlack focus:!bg-primeBlack"
          variant="outlined"
          onClick={onResetSwapSetting}>
          Reset
        </Button>
        <Button className="grow paragraph" variant="solid" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default SwapSetting;

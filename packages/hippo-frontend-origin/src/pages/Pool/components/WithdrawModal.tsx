import { Modal } from 'components/Antd';
import Button from 'components/Button';
import NumberInput from 'components/NumberInput';
import SlideInput from 'components/SlideInput';
import { useFormik } from 'formik';
import useHippoClient from 'hooks/useHippoClient';
import { useState } from 'react';
import { CloseIcon, PlusSMIcon } from 'resources/icons';
import { IPool } from 'types/pool';
import styles from './WithdrawModal.module.scss';

interface TWithdrawForm {
  amount: number;
}

interface TProps {
  tokenPair?: IPool;
  onDismissModal: () => void;
}

// const totalLiquidity = 0.99999;

const WithdrawModal: React.FC<TProps> = ({ tokenPair, onDismissModal }) => {
  const isVisible = !!tokenPair;
  const [loading, setLoading] = useState(false);
  const { hippoSwap, tokenStores } = useHippoClient();

  const onSubmitWithdraw = async (values: TWithdrawForm) => {
    console.log('on submit', values, tokenPair);
    setLoading(true);
    const lhsSymbol = tokenPair?.token0.symbol || '';
    const rhsSymbol = tokenPair?.token1.symbol || '';
    const lpTokenResult = await hippoSwap?.getCpLpTokenInfo(lhsSymbol, rhsSymbol);
    if (!lpTokenResult) {
      throw new Error(`Direct CP Pool for ${lhsSymbol} - ${rhsSymbol} does not exist`);
    }
    const { jointName } = lpTokenResult;
    if (tokenStores && tokenStores[jointName]) {
    }
    // const lpTokenTag = typeInfoToTypeTag(lpToken.token_type);
    console.log('>>>>');
    // await requestWithdraw(
    //   tokenPair?.token0.symbol || '',
    //   tokenPair?.token1.symbol || '',
    //   values.amount,
    //   0,
    //   0
    // );
    setLoading(false);
    onDismissModal();
  };

  const formik = useFormik({
    initialValues: {
      amount: 0
    },
    // validationSchema: DepositSchema,
    onSubmit: onSubmitWithdraw
  });

  const onRequestAmountToWithdraw = async (amount: number) => {
    //TODO: this will update the amount of each token to withdraw when user amount change
    const lhsSymbol = tokenPair?.token0.symbol || '';
    const rhsSymbol = tokenPair?.token1.symbol || '';
    const lpTokenResult = await hippoSwap?.getCpLpTokenInfo(lhsSymbol, rhsSymbol);
    if (!lpTokenResult) {
      throw new Error(`Direct CP Pool for ${lhsSymbol} - ${rhsSymbol} does not exist`);
    }
    const { jointName } = lpTokenResult;
    if (tokenStores && tokenStores[jointName]) {
      const lhsAmountCir = hippoSwap?.getTokenTotalSupplyBySymbol(lhsSymbol);
      const rhsAmountCir = hippoSwap?.getTokenTotalSupplyBySymbol(rhsSymbol);
      console.log('>>>on Request amount to withdraw', amount, lhsAmountCir, rhsAmountCir);
    }
  };

  const randomToken0 = formik.values.amount * Math.random();
  const randomToken1 = formik.values.amount - randomToken0;
  const totalLiquidity = tokenPair?.totalValueLockedUSD;

  const handleOnChange = (val: any) => {
    formik.setFieldValue('amount', val);
    onRequestAmountToWithdraw(val);
  };

  const paresSlideValue = () => {
    if (typeof formik.values.amount === 'number') return formik.values.amount;
    if (typeof formik.values.amount === 'string') return parseInt(formik.values.amount);
    return 0;
  };

  return (
    <Modal
      onCancel={onDismissModal}
      className=""
      wrapClassName={styles.withdrawModal}
      visible={isVisible}
      footer={null}
      maskClosable={false}
      closeIcon={<CloseIcon />}>
      <form onSubmit={formik.handleSubmit}>
        <div className="flex flex-col items-center gap-12">
          <h5 className="font-bold text-grey-900">Withdraw Liquidity</h5>
          <div className="flex flex-col w-full gap-3">
            <div className="text-grey-900 text-base">Amount(estimated)</div>
            <NumberInput
              className="w-full rounded-xl bg-input h-[56px] header5 bold"
              min={0}
              max={totalLiquidity}
              placeholder="0.00"
              // onFocus={() => handleOnChange(null)}
              controls={false}
              value={formik.values.amount}
              onChange={(val) => handleOnChange(val)}
            />
            <div className="helpText font-bold text-grey-700">
              <span className="uppercase">
                ({totalLiquidity} {tokenPair?.token0.symbol} / {tokenPair?.token1.symbol}
              </span>{' '}
              liquidity tokens)
            </div>
            <div className="my-4">
              <SlideInput
                min={0}
                max={parseFloat(tokenPair?.totalValueLockedUSD || '')}
                tipFormatter={(value) => <div className="">{value}</div>}
                step={parseFloat(tokenPair?.totalValueLockedUSD || '') / 100}
                onChange={(val: number) => handleOnChange(val)}
                value={paresSlideValue()}
              />
            </div>
            <div className="flex flex-col w-full gap-2">
              <div className="paragraph">You will receive:</div>
              <div className="flex w-full justify-between items-center">
                <div className="header5 bold text-grey-900 py-2 px-4 uppercase">
                  {randomToken0.toFixed(7)} {tokenPair?.token0.symbol}
                </div>
                <PlusSMIcon />
                <div className="header5 bold text-grey-900 py-2 px-4 uppercase">
                  {randomToken1.toFixed(7)} {tokenPair?.token1.symbol}
                </div>
              </div>
            </div>
          </div>
          <Button className="w-full rounded-[8px] font-bold" type="submit" isLoading={loading}>
            <h6 className="text-inherit">Withdraw</h6>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WithdrawModal;

import { Checkbox, Modal } from 'components/Antd';
import Button from 'components/Button';
import CoinIcon from 'components/CoinIcon';
import NumberInput from 'components/NumberInput';
import TextLink from 'components/TextLink';
import { useFormik } from 'formik';
import useToken from 'hooks/useToken';
import { useCallback } from 'react';
import { CloseIcon, PlusIcon } from 'resources/icons';
import { IPool, IPoolToken } from 'types/pool';
// import * as Yup from 'yup';
import styles from './DepositModal.module.scss';

interface TDepositForm {
  token0Amount: Number;
  token1Amount: Number;
  total: Number;
  agreed: boolean;
}

interface TProps {
  tokenPair?: IPool;
  onDismissModal: () => void;
}

// const DepositSchema = Yup.object().shape({
//   agreed: Yup.boolean().isTrue(),
//   token0Amount: Yup.number().positive(),
//   token1Amount: Yup.number().positive()
// });

const DepositModal: React.FC<TProps> = ({ tokenPair, onDismissModal }) => {
  const isVisible = !!tokenPair;
  const { retreiveTokenImg } = useToken();
  const onSubmitDeposit = (values: TDepositForm) => {
    console.log('on submit', values);
    onDismissModal();
  };

  const formik = useFormik({
    initialValues: {
      token0Amount: 0,
      token1Amount: 0,
      total: 0,
      agreed: false
    },
    // validationSchema: DepositSchema,
    onSubmit: onSubmitDeposit
  });

  const getWalletTokenBalance = (token: IPoolToken) => {
    console.log('getWalletTokenBalance>>>', token);
    return Number(0).toFixed(4);
  };

  const onHandleInput = useCallback(
    (field: string, value: any) => {
      formik.setFieldValue(field, value);
      // TODO: Calculate and update total field
      formik.setFieldValue('total', formik.values.token0Amount + formik.values.token1Amount);
    },
    [formik]
  );

  const renderTokenInput = useCallback(
    (type: 'token0' | 'token1') => {
      if (!tokenPair) return null;
      const token = tokenPair[type];
      const logoUri = retreiveTokenImg([token]);
      const inputField = type === 'token0' ? 'token0Amount' : 'token1Amount';
      return (
        <div className="flex flex-col gap-2 items-end w-full">
          <div className="flex gap-10 w-full justify-between">
            <div className="flex gap-2 items-center">
              <CoinIcon logoSrc={logoUri && logoUri[0] ? logoUri[0] : ''} />
              <div className="header5 bold text-primary">{token.symbol}</div>
            </div>
            <NumberInput
              className="grow rounded-[10px] bg-input h-[56px] max-w-[320px] header5 bold"
              min={0}
              placeholder="0.00"
              onFocus={() => onHandleInput(inputField, null)}
              controls={false}
              value={formik.values[inputField]}
              onChange={(val) => onHandleInput(inputField, val)}
            />
          </div>
          <div className="border-[1px] rounded border-[#959595] py-1 px-2 text-[#575757] font-bold">
            Balance: {getWalletTokenBalance(token)}
          </div>
        </div>
      );
    },
    [tokenPair, retreiveTokenImg, formik.values, onHandleInput]
  );

  return (
    <Modal
      onCancel={onDismissModal}
      className=""
      wrapClassName={styles.depositModal}
      visible={isVisible}
      footer={null}
      maskClosable={false}
      closeIcon={<CloseIcon />}>
      <form onSubmit={formik.handleSubmit}>
        <div className="px-10 flex flex-col items-center gap-10">
          <div className="header5 bold">Deposit Liquidity</div>
          <div className="w-full">
            <div className="flex flex-col gap-2 w-full">
              {renderTokenInput('token0')}
              <PlusIcon />
              {renderTokenInput('token1')}
            </div>
            <hr className="h-[2px] bg-[#D5D5D5] w-full my-4" />
            <div className="flex items-center justify-end w-full gap-6">
              <div className="header5 bold text-primary">Total</div>
              <NumberInput
                className="grow rounded-[10px] bg-input h-[56px] max-w-[320px] header5 bold"
                min={0}
                placeholder="0.00"
                readOnly
                controls={false}
                value={formik.values.total}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-prime paragraph bold">
              Estimated earnings from fees(7d) + Aquafarm rewards
            </div>
            <div className="flex justify-between pt-12">
              <div className="flex gap-4 items-center">
                <div className="header5 bold text-primary">$1.23</div>
                <div className="paragraph text-primary">/ month</div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="header5 bold text-primary">100%</div>
                <div className="paragraph text-primary">APR</div>
              </div>
            </div>
          </div>
          <Checkbox>
            <div className="helpText text-primary">
              I verify that I have read the <TextLink href="">Orca Pools Guide</TextLink> and{' '}
              <TextLink href="">understand the risks of providing liquidity</TextLink>, including
              impermanent loss.
            </div>
          </Checkbox>
          <Button className="w-full rounded-[20px] font-bold" type="submit">
            Deposit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DepositModal;

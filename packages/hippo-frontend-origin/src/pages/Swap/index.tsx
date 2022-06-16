import { Popover } from 'components/Antd';
import Card from 'components/Card';
import { Formik, FormikHelpers } from 'formik';
import { useCallback, useMemo, useState } from 'react';
import * as yup from 'yup';
import { SettingIcon } from 'resources/icons';
import SwapSetting from './components/SwapSetting';
import styles from './Swap.module.scss';
import { useSelector } from 'react-redux';
import { getSwapSettings } from 'modules/swap/reducer';
import TokenSwap from './components/TokenSwap';
import useFetchToken from 'hooks/useFetchToken';
import useHippoClient from 'hooks/useHippoClient';
import { ISwapSettings } from './types';

const validationSchema = yup.object({
  // currencyFrom: yup.object().shape({
  //   // token: yup.required(),
  //   amount: yup.number().required(),
  //   balance: yup.number().required()
  // }),
  // currencyTo: yup.object().shape({
  //   // token: yup.required(),
  //   amount: yup.number().required(),
  //   balance: yup.number().required()
  // })
  currencyFrom: yup.object({
    // token: yup.required(),
    amount: yup.number().required(),
    balance: yup.number().required()
  })
});

const Swap: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const swapSettings = useSelector(getSwapSettings);
  const { hippoSwap, hippoWallet, requestSwap } = useHippoClient();
  useFetchToken();

  const renderCardHeader = useMemo(
    () => (
      <div className="w-full flex my-8 justify-center relative">
        <h5 className="font-bold">Swap</h5>
        <Popover
          overlayClassName={styles.popover}
          trigger="click"
          visible={isVisible}
          onVisibleChange={(visible) => setIsVisible(visible)}
          content={<SwapSetting onClose={() => setIsVisible(false)} />}
          placement="rightBottom">
          <button className="absolute right-9 top-0 cursor-pointer">
            <SettingIcon />
          </button>
        </Popover>
      </div>
    ),
    [setIsVisible, isVisible]
  );

  const onSubmitSwap = useCallback(
    async (values: ISwapSettings, formikHelper: FormikHelpers<ISwapSettings>) => {
      const fromSymbol = values.currencyFrom?.token.symbol;
      const toSymbol = values.currencyTo?.token.symbol;
      const fromUiAmt = values.currencyFrom?.amount;
      if (hippoSwap && hippoWallet && fromSymbol && toSymbol && fromUiAmt) {
        const quote = hippoSwap.getBestQuoteBySymbols(fromSymbol, toSymbol, fromUiAmt, 3);
        if (quote) {
          const minOut = quote.bestQuote.outputUiAmt * (1 - values.slipTolerance / 100);
          await requestSwap(fromSymbol, toSymbol, fromUiAmt, minOut, () => {
            formikHelper.resetForm();
          });
        } else {
          // TODO: info bubble "route note available"
        }
      }
    },
    [hippoSwap, hippoWallet, requestSwap]
  );

  return (
    <div className="w-full flex justify-center items-center h-full">
      <Formik
        initialValues={swapSettings}
        validationSchema={validationSchema}
        onSubmit={onSubmitSwap}>
        <Card className="w-[497px] min-h-[430px] flex flex-col pb-10 border-4 border-grey-900 shadow-figma">
          {renderCardHeader}
          <TokenSwap />
        </Card>
      </Formik>
    </div>
  );
};

export default Swap;

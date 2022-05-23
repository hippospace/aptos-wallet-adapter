import { Popover } from 'components/Antd';
import Card from 'components/Card';
import { Formik } from 'formik';
import { useMemo, useState } from 'react';
import * as yup from 'yup';
import { SettingIcon } from 'resources/icons';
import SwapSetting from './components/SwapSetting';
import styles from './Swap.module.scss';
import { useSelector } from 'react-redux';
import { getSwapSettings } from 'modules/swap/reducer';
import TokenSwap from './components/TokenSwap';
import useFetchToken from 'hooks/useFetchToken';

const validationSchema = yup.object({
  // tierId: yup.number().required()
});

const Swap: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const swapSettings = useSelector(getSwapSettings);
  useFetchToken();

  const renderCardHeader = useMemo(
    () => (
      <div className="w-full flex my-8 justify-center relative">
        <div className="paragraph bold">Swap</div>
        <Popover
          overlayClassName={styles.popover}
          trigger="click"
          visible={isVisible}
          onVisibleChange={(visible) => setIsVisible(visible)}
          content={<SwapSetting onClose={() => setIsVisible(false)} />}
          placement="bottomRight">
          <button className="absolute right-9 top-0 opacity-50 hover:opacity-80 active:opacity-100 cursor-pointer">
            <SettingIcon />
          </button>
        </Popover>
      </div>
    ),
    [setIsVisible, isVisible]
  );

  return (
    <div className="w-full flex justify-center items-center h-full">
      <Formik
        initialValues={swapSettings}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          console.log('>>sumbit swap', values);
        }}>
        <Card className="w-[497px] min-h-[430px] flex flex-col pb-10">
          {renderCardHeader}
          <TokenSwap />
        </Card>
      </Formik>
    </div>
  );
};

export default Swap;

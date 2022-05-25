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

  return (
    <div className="w-full flex justify-center items-center h-full">
      <Formik
        initialValues={swapSettings}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          console.log('>>sumbit swap', values);
        }}>
        <Card className="w-[497px] min-h-[430px] flex flex-col pb-10 border-4 border-grey-900 shadow-figma">
          {renderCardHeader}
          <TokenSwap />
        </Card>
      </Formik>
    </div>
  );
};

export default Swap;

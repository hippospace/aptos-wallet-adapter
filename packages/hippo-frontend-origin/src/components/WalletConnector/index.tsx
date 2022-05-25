import Button from 'components/Button';
import { useCallback } from 'react';
import commonActions from 'modules/common/actions';
import { useDispatch, useSelector } from 'react-redux';
// import WalletsModal from './components/WalletsModal';
import useAptosWallet from 'hooks/useAptosWallet';
import { walletAddressEllipsis } from 'utils/utility';
import { CaretIcon } from 'resources/icons';
import { Popover } from 'components/Antd';
// import useConnector from 'hooks/useConnector';
import { getShowWalletConnector } from 'modules/common/reducer';
import styles from './WalletConnector.module.scss';
import WalletSelector from './components/WalletSelector';

const WalletConnector: React.FC = () => {
  const dispatch = useDispatch();
  const { address } = useAptosWallet();
  const showWalletConnector = useSelector(getShowWalletConnector);
  // const { SUPPORTED_WALLETS } = useConnector();

  const toggleConnectModal = useCallback(
    (visible: boolean) => {
      dispatch(commonActions.TOGGLE_WALLET_CONNECTOR(visible));
    },
    [dispatch]
  );

  return (
    <>
      <Popover
        overlayClassName={styles.popover}
        trigger="click"
        visible={!address && showWalletConnector}
        onVisibleChange={(visible) => toggleConnectModal(visible)}
        content={<WalletSelector />}
        placement="bottomLeft">
        <div className="flex gap-4 items-center">
          <Button
            className="min-w-[156px] h-10 rounded-xl !shadow-sm !text-grey-900 !bg-primePurple-100 font-bold"
            // onClick={!address ? toggleConnectModal : undefined}
          >
            {address ? walletAddressEllipsis(address) : 'Connect To Wallet'}
          </Button>
          <CaretIcon className="fill-black" />
        </div>
      </Popover>
    </>
  );
};

export default WalletConnector;

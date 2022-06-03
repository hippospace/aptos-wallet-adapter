/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import WebWallet from 'components/WebWallet';

const WalletConnector: React.FC = () => {
  const dispatch = useDispatch();
  const { activeWallet, openModal, open, closeModal } = useAptosWallet();
  const privateKeyObject = activeWallet?.aptosAccount?.toPrivateKeyObject();
  // const showWalletConnector = useSelector(getShowWalletConnector);
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
        visible={open}
        onVisibleChange={(visible) => (visible ? openModal() : closeModal())}
        content={<WebWallet />}
        destroyTooltipOnHide
        placement="bottomLeft">
        <div className="flex gap-4 items-center">
          <Button
            className="min-w-[156px] h-10 rounded-xl !shadow-sm !text-grey-900 !bg-primePurple-100 font-bold"
            // onClick={!address ? toggleConnectModal : undefined}
          >
            {activeWallet
              ? walletAddressEllipsis(privateKeyObject?.address || '')
              : 'Connect To Wallet'}
          </Button>
          <CaretIcon className="fill-black" />
        </div>
      </Popover>
    </>
  );
};

export default WalletConnector;

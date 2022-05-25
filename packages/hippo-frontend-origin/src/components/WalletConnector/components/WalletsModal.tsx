import { Modal } from 'components/Antd';
import { CloseIcon } from 'resources/icons';
import commonActions from 'modules/common/actions';
import { useCallback, useMemo } from 'react';
import { getShowWalletConnector } from 'modules/common/reducer';
import { useSelector, useDispatch } from 'react-redux';
import { MetamaskIcon, CoinbaseIcon, WalletConnectIcon, PhantomIcon } from 'resources/icons';
import styles from './WalletsModal.module.scss';
import useConnector from 'hooks/useConnector';
import Button from 'components/Button';

type TOptionProps = {
  onClick: (...args: any) => void;
  label: string;
};

const Option: React.FC<TOptionProps> = ({ onClick, label }) => {
  const getWalletIcon = () => {
    switch (label) {
      case 'MetaMask':
        return <MetamaskIcon width={24} height={24} />;
      case 'Wallet Connect':
        return <WalletConnectIcon width={24} height={24} />;
      case 'Coinbase Wallet':
        return <CoinbaseIcon width={24} height={24} />;
      case 'Phantom':
        return <PhantomIcon width={24} height={24} />;
      default:
        return null;
    }
  };

  return (
    <Button onClick={onClick} className="flex gap-2 w-1/2 justify-start mt-2" variant="outlined">
      <div>{getWalletIcon()}</div>
      <div className="font-bold text-black">{label}</div>
    </Button>
  );
};

const WalletsModal = () => {
  const dispatch = useDispatch();
  const showWalletConnector = useSelector(getShowWalletConnector);
  const { SUPPORTED_WALLETS } = useConnector();

  const handleCancel = useCallback(() => {
    if (showWalletConnector) {
      dispatch(commonActions.TOGGLE_WALLET_CONNECTOR(false));
    }
  }, [dispatch, showWalletConnector]);

  const getModalContent = useMemo(() => {
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key];
      return <Option key={key} label={option.name} onClick={() => {}} />;
    });
  }, [SUPPORTED_WALLETS]);

  return (
    <Modal
      onCancel={handleCancel}
      className=""
      wrapClassName={styles.walletsModal}
      visible={showWalletConnector}
      footer={null}
      closeIcon={<CloseIcon />}>
      <div className="header5 bold text-black">Connect your wallet</div>
      <div className="flex flex-wrap mt-6">{getModalContent}</div>
    </Modal>
  );
};

export default WalletsModal;

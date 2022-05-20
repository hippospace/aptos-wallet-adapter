import Button from 'components/Button';
import { useCallback } from 'react';
import commonActions from 'modules/common/actions';
import { useDispatch } from 'react-redux';
import WalletsModal from './components/WalletsModal';

const WalletConnector: React.FC = (props: any) => {
  const dispatch = useDispatch();

  const toggleConnectModal = useCallback(() => {
    dispatch(commonActions.TOGGLE_WALLET_CONNECTOR(true));
  }, [dispatch]);

  return (
    <>
      <Button
        className="min-w-[156px] rounded-[10px] shadow-md paragraph h-full bg-secondary header5 bold"
        onClick={toggleConnectModal}>
        Connect To Wallet
      </Button>
      <WalletsModal />
    </>
  );
};

export default WalletConnector;

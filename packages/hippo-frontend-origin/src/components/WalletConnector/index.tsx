import Button from 'components/Button';
import { useCallback } from 'react';
import commonActions from 'modules/common/actions';
import { useDispatch } from 'react-redux';
import WalletsModal from './components/WalletsModal';
import useAptosWallet from 'hooks/useAptosWallet';
import { walletAddressEllipsis } from 'utils/utility';

const WalletConnector: React.FC = () => {
  const dispatch = useDispatch();

  const toggleConnectModal = useCallback(() => {
    dispatch(commonActions.TOGGLE_WALLET_CONNECTOR(true));
  }, [dispatch]);

  const { address } = useAptosWallet();

  console.log('MEME>>>', address);
  return (
    <>
      <Button
        className="min-w-[156px] rounded-[10px] shadow-md paragraph h-full bg-secondary header5 bold"
        onClick={!address ? toggleConnectModal : undefined}>
        {address ? walletAddressEllipsis(address) : 'Connect To Wallet'}
      </Button>
      <WalletsModal />
    </>
  );
};

export default WalletConnector;

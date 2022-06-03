import useAptosWallet from 'hooks/useAptosWallet';
import ConnectedScreens from './compoents/ConnectedScreens';
import GetStartScreens from './compoents/GetStartScreens';

const WebWallet: React.FC = () => {
  const { activeWallet } = useAptosWallet();

  if (!activeWallet) {
    return <GetStartScreens />;
  }
  return <ConnectedScreens />;
};

export default WebWallet;

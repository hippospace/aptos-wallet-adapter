import Button from 'components/Button';
import { useWallet } from 'components/WalletAdapter/useWallet';

const WalletMenu: React.FC = () => {
  const { disconnect } = useWallet();
  return (
    <div className="flex">
      <Button onClick={disconnect}>Logout</Button>
    </div>
  );
};

export default WalletMenu;

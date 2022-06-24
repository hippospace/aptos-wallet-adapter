import Button from 'components/Button';
import { useWallet } from 'components/WalletAdapter/useWallet';

const WalletMenu: React.FC = () => {
  const { disconnect } = useWallet();
  return (
    <div className="flex w-full p-2">
      <Button onClick={disconnect} className="w-full">
        Logout
      </Button>
    </div>
  );
};

export default WalletMenu;

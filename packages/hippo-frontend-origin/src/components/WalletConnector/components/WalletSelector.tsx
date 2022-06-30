import Button from 'components/Button';
import { useMemo } from 'react';
import { MetamaskIcon, WalletConnectIcon, CoinbaseIcon, PhantomIcon } from 'resources/icons';
import { useWallet } from 'components/WalletAdapter/useWallet';

type TOptionProps = {
  onClick?: () => void;
  label: string;
  icon?: string;
};

const Option: React.FC<TOptionProps> = ({ onClick, label, icon }) => {
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
        return icon ? (
          <img src={icon} width={24} height={24} className="block rounded-full" />
        ) : (
          <div className="bg-grey-700 block w-6 h-6 rounded-full" />
        );
    }
  };

  return (
    <Button
      onClick={onClick ? onClick : undefined}
      className="flex gap-2 grow justify-start mt-2 rounded-[0px] w-full"
      variant="outlined">
      {getWalletIcon()}
      <div className="font-bold text-black">{label}</div>
    </Button>
  );
};

const WalletSelector: React.FC = () => {
  const { wallets, connect } = useWallet();

  const renderButtonGroup = useMemo(() => {
    return wallets.map((wallet) => {
      const option = wallet.adapter;
      return (
        <Option
          key={option.name}
          label={option.name}
          icon={option.icon}
          onClick={() => connect(option.name)}
        />
      );
    });
  }, [wallets, connect]);

  return (
    <div className="p-6 flex flex-col gap-6">
      <h6 className="font-bold text-black">Connect your wallet</h6>
      <div className="flex flex-wrap gap-2">{renderButtonGroup}</div>
    </div>
  );
};

export default WalletSelector;

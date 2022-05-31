import useConnector from 'hooks/useConnector';
import Button from 'components/Button';
import { useMemo } from 'react';
import { MetamaskIcon, WalletConnectIcon, CoinbaseIcon, PhantomIcon } from 'resources/icons';
import useAptosWallet from 'hooks/useAptosWallet';
import { walletAddressEllipsis } from 'utils/utility';

type TOptionProps = {
  onClick?: () => {};
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
        return <div className="bg-grey-700 block w-6 h-6 rounded-full" />;
    }
  };

  return (
    <Button
      onClick={onClick ? onClick : undefined}
      className="flex gap-2 grow max-w-[200px] justify-start mt-2 rounded-[0px]"
      variant="outlined">
      <div>{getWalletIcon()}</div>
      <div className="font-bold text-black">{label}</div>
    </Button>
  );
};

const WalletSelector: React.FC = () => {
  const { SUPPORTED_WALLETS } = useConnector();
  const { activeWallet } = useAptosWallet();

  const renderButtonGroup = useMemo(() => {
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key];
      return <Option key={key} label={option.name} onClick={() => true} />;
    });
  }, [SUPPORTED_WALLETS]);

  return (
    <div className="">
      <h6 className="font-bold text-black">
        {activeWallet
          ? walletAddressEllipsis(activeWallet?.aptosAccount?.address?.toString() || '')
          : 'Connect your wallet'}
      </h6>
      <div className="flex flex-wrap gap-2">{renderButtonGroup}</div>
    </div>
  );
};

export default WalletSelector;

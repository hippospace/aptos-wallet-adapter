import useAptosWallet from 'hooks/useAptosWallet';

const WalletOverview: React.FC = () => {
  const { activeWallet } = useAptosWallet();
  const privateKeyObject = activeWallet?.aptosAccount?.toPrivateKeyObject();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <small className="text-grey-500">Wallet name:</small>
        <small className="text-grey-500">{activeWallet?.walletName}</small>
      </div>
      <div className="flex gap-2 flex-wrap whitespace-pre-line">
        <small className="text-grey-500">Wallet Address:</small>
        <small className="text-grey-500 w-full break-words">{privateKeyObject?.address}</small>
      </div>
    </div>
  );
};

export default WalletOverview;

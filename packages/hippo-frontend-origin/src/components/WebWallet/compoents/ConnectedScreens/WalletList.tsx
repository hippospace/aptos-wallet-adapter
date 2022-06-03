import { List } from 'components/Antd';
import useAptosWallet from 'hooks/useAptosWallet';

const WalletList: React.FC = () => {
  const { walletList, setActiveAptosWallet } = useAptosWallet();

  return (
    <div className="flex flex-col gap-4">
      <h5 className="text-grey-900 font-bold">Wallet List</h5>
      <List
        bordered
        dataSource={walletList}
        renderItem={(wallet) => (
          <List.Item
            onClick={() => setActiveAptosWallet(wallet.walletName)}
            className="cursor-pointer">
            <h5>{wallet.walletName}</h5>
          </List.Item>
        )}
      />
    </div>
  );
};

export default WalletList;

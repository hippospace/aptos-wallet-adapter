import { AccountBookOutlined, DollarCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu, MenuProps } from 'components/Antd';
import useAptosWallet from 'hooks/useAptosWallet';
import { useState } from 'react';
import CoinList from './compoents/CoinList';
import Faucet from './compoents/Faucet';
import Settings from './compoents/Settings';
import WalletLogin from './compoents/WalletLogin';
import WalletOverview from './compoents/WalletOverview';
import styles from './WebWallet.module.scss';

const items: MenuProps['items'] = [
  {
    label: 'Coin list',
    key: 'coinList',
    icon: <DollarCircleOutlined />
  },
  {
    label: 'Faucet',
    key: 'faucet',
    icon: <AccountBookOutlined />
  },
  {
    label: 'Settings',
    key: 'settings',
    icon: <SettingOutlined />
  }
];

const WebWallet: React.FC = () => {
  const { activeWallet } = useAptosWallet();
  const [current, setCurrent] = useState('coinList');

  if (!activeWallet) {
    return <WalletLogin />;
  }

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  const getModalContent = () => {
    switch (current) {
      case 'coinList':
        return <CoinList />;
      case 'faucet':
        return <Faucet />;
      case 'settings':
        return <Settings />;
      default:
        return <CoinList />;
    }
  };

  return (
    <div className={styles.webWallet}>
      <WalletOverview />
      {getModalContent()}
      <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
    </div>
  );
};

export default WebWallet;

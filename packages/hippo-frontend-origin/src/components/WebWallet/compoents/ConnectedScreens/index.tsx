import { AccountBookOutlined, DollarCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu, MenuProps } from 'components/Antd';
import { useState } from 'react';
import cx from 'classnames';
import CoinList from './CoinList';
import Faucet from './Faucet';
import Settings from './Settings';
import WalletOverview from './WalletOverview';
import styles from './ConnectedScreens.module.scss';

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

const ConnectedScreens: React.FC = () => {
  const [current, setCurrent] = useState('coinList');

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
    <div className={cx(styles.connectedScreens, 'flex flex-col gap-4')}>
      <WalletOverview />
      <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
      {getModalContent()}
    </div>
  );
};

export default ConnectedScreens;

// import { SettingFilled } from '@ant-design/icons';
import { Menu, MenuProps } from 'components/Antd';
import { useState } from 'react';
// import cx from 'classnames';
import CoinList from './CoinList';
import Faucet from './Faucet';
import Settings from './Settings';
import WalletOverview from './WalletOverview';
import styles from './ConnectedScreens.module.scss';
import { CoinListIcon, FaucetIcon, SettingIcon } from 'resources/icons';

const items: MenuProps['items'] = [
  {
    // label: 'Coin list',
    key: 'coinList',
    icon: <CoinListIcon className="fill-black" />
  },
  {
    // label: 'Faucet',
    key: 'faucet',
    icon: <FaucetIcon className="fill-black" />
  },
  {
    // label: 'Settings',
    key: 'settings',
    icon: <SettingIcon />
  }
];

const ConnectedScreens: React.FC = () => {
  const [current, setCurrent] = useState('coinList');

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  const onReset = () => setCurrent('coinList');

  const getModalContent = () => {
    switch (current) {
      case 'coinList':
        return <CoinList />;
      case 'faucet':
        return <Faucet />;
      case 'settings':
        return <Settings onReset={onReset} />;
      default:
        return <CoinList />;
    }
  };

  return (
    <div className="flex flex-col">
      <WalletOverview />
      <div className="flex flex-col gap-4 bg-primary px-9 py-6 rounded-[11px]">
        {getModalContent()}
      </div>
      <Menu
        mode="horizontal"
        theme="dark"
        className={styles.menu}
        onClick={onClick}
        selectedKeys={[current]}
        items={items}
      />
    </div>
  );
};

export default ConnectedScreens;

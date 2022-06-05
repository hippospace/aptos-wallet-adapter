// import { SettingFilled } from '@ant-design/icons';
import { Drawer, Menu, MenuProps } from 'components/Antd';
import { useState } from 'react';
// import cx from 'classnames';
import CoinList from './CoinList';
import Faucet from './Faucet';
import Settings from './Settings';
import WalletOverview from './WalletOverview';
import styles from './ConnectedScreens.module.scss';
import { CloseIcon, CoinListIcon, FaucetIcon, LogoIcon, SettingIcon } from 'resources/icons';

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
  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

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
      <WalletOverview onShowWalletList={showDrawer} />
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
      <Drawer
        title={
          <div className="flex w-full justify-between items-center">
            <LogoIcon className="w-12 h-12" />
            <CloseIcon onClick={onClose} className="cursor-pointer" />
          </div>
        }
        placement="left"
        className={styles.drawer}
        closable={false}
        // onClose={onClose}
        visible={visible}
        getContainer={false}
        style={{ position: 'absolute' }}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </div>
  );
};

export default ConnectedScreens;

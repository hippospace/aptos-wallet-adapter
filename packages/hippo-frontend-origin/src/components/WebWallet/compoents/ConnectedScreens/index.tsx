import { Drawer, Menu, MenuProps, Tabs } from 'components/Antd';
import { useState } from 'react';
import cx from 'classnames';
import CoinList from './CoinList';
import Faucet from './Faucet';
import Settings from './Settings';
import WalletOverview from './WalletOverview';
import styles from './ConnectedScreens.module.scss';
import { CloseIcon, CoinListIcon, FaucetIcon, LogoIcon, SettingIcon } from 'resources/icons';
import WalletList from './WalletList';
import AddNewWallet from './AddNewWallet';
import ImportWallet from './ImportWallet';

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
  const [addNew, setAddNew] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const onClick: MenuProps['onClick'] = (e) => {
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
      <div className="flex flex-col gap-4 bg-primary px-9 py-6 rounded-[11px] h-[520px]">
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
        visible={visible}
        getContainer={false}
        style={{ position: 'absolute' }}>
        <WalletList onSelect={onClose} onAddNew={() => setAddNew(true)} />
      </Drawer>
      {addNew && (
        <div className="absolute inset-0 bg-secondary z-[9999] py-16 px-8 border-4 border-grey-900 rounded-[11px]">
          <div onClick={() => setAddNew(false)} className="absolute right-12 top-9 cursor-pointer">
            <CloseIcon />
          </div>
          <Tabs defaultActiveKey="1" className={cx(styles.tabs)}>
            <Tabs.TabPane tab="Add Wallet" key="1">
              <AddNewWallet onSuccess={() => setAddNew(false)} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Import Wallet" key="2">
              <ImportWallet onSuccess={() => setAddNew(false)} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ConnectedScreens;

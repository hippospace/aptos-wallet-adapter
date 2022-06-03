import { AccountBookOutlined, LeftOutlined, SettingOutlined } from '@ant-design/icons';
import { MenuProps, Menu } from 'antd';
import Button from 'components/Button';
import useAptosWallet from 'hooks/useAptosWallet';
import { useMemo, useState } from 'react';
import AddNewWallet from './AddNewWallet';
import ChangePassword from './ChangePassword';
import ImportWallet from './ImportWallet';
import WalletList from './WalletList';

const Settings: React.FC = () => {
  const { disconnect } = useAptosWallet();
  const [screen, setScreen] = useState('');

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        label: 'Change Password',
        key: 'changePasword',
        icon: <AccountBookOutlined />,
        onClick: () => setScreen('changePassword')
      },
      {
        label: 'Manage Wallets',
        key: 'settings',
        icon: <SettingOutlined />,
        children: [
          {
            label: 'Existing Wallets',
            key: 'existing wallets',
            onClick: () => setScreen('walletList')
          },
          {
            label: 'Create new wallet',
            key: 'create new wallet',
            onClick: () => setScreen('createWallet')
          },
          {
            label: 'Import Wallet',
            key: 'importWallet',
            onClick: () => setScreen('importWallet')
          }
        ]
      }
    ],
    []
  );

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    //  setCurrent(e.key);
  };

  const onBackToSetting = () => setScreen('');

  const renderContent = useMemo(() => {
    switch (screen) {
      case 'changePassword':
        return <ChangePassword onSuccess={onBackToSetting} />;
      case 'createWallet':
        return <AddNewWallet onSuccess={() => setScreen('walletList')} />;
      case 'walletList':
        return <WalletList />;
      case 'importWallet':
        return <ImportWallet onSuccess={() => setScreen('walletList')} />;
      default:
        return (
          <div className="flex flex-col gap-4">
            <Menu onClick={onClick} mode="inline" items={items} defaultOpenKeys={['settings']} />
            <Button onClick={disconnect}>Logout</Button>
          </div>
        );
    }
  }, [screen, items, disconnect]);

  return (
    <div className="flex flex-col gap-4">
      {!!screen && (
        <div
          onClick={onBackToSetting}
          className="font-bold text-grey-500 cursor-pointer flex items-center">
          <LeftOutlined /> Back
        </div>
      )}
      {renderContent}
    </div>
  );
};

export default Settings;

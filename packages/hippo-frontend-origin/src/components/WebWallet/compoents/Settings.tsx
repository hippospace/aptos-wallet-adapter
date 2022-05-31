import { DollarCircleOutlined, AccountBookOutlined, SettingOutlined } from '@ant-design/icons';
import { MenuProps, Menu } from 'antd';
import Button from 'components/Button';
import useAptosWallet from 'hooks/useAptosWallet';

const Settings: React.FC = () => {
  const { disconnect } = useAptosWallet();

  const items: MenuProps['items'] = [
    {
      label: <Button onClick={disconnect}>Logout</Button>,
      key: 'coinList',
      icon: <DollarCircleOutlined />
    },
    {
      label: 'Change Password',
      key: 'faucet',
      icon: <AccountBookOutlined />
    },
    {
      label: 'Manage Wallets',
      key: 'settings',
      icon: <SettingOutlined />,
      children: [
        {
          label: 'existing wallets',
          key: 'existing wallets'
        },
        {
          label: 'create new wallet',
          key: 'create new wallet'
        },
        {
          label: 'switch wallet',
          key: 'switch wallet'
        }
      ]
    }
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    //  setCurrent(e.key);
  };
  return (
    <div className="">
      <Menu onClick={onClick} mode="inline" items={items} />
    </div>
  );
};

export default Settings;

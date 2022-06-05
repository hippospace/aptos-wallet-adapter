import Button from 'components/Button';
import useAptosWallet from 'hooks/useAptosWallet';
import { useMemo, useState } from 'react';
import { CaretRightIcon, CloseIcon } from 'resources/icons';
import AddNewWallet from './AddNewWallet';
import ChangePassword from './ChangePassword';
import ImportWallet from './ImportWallet';
import WalletDetail from './WalletDetail';
import WalletList from './WalletList';

interface TProps {
  onReset: () => void;
}

const Settings: React.FC<TProps> = ({ onReset }) => {
  const { disconnect } = useAptosWallet();
  const [screen, setScreen] = useState('');

  const settingMenu = useMemo(() => {
    return [
      {
        label: 'Manage Wallet',
        helpText: 'Rename, Private Key',
        onClick: () => setScreen('manageWallet')
      },
      {
        label: 'Change Password',
        helpText: 'Update your master password',
        onClick: () => setScreen('changePassword')
      }
    ];
  }, []);

  const onBackToSetting = () => setScreen('');

  const renderContent = useMemo(() => {
    switch (screen) {
      case 'manageWallet':
        return <WalletDetail onSuccess={onBackToSetting} />;
      case 'changePassword':
        return <ChangePassword onSuccess={onBackToSetting} />;
      case 'createWallet':
        return <AddNewWallet onSuccess={() => setScreen('walletList')} />;
      case 'walletList':
        return <WalletList onSuccess={onReset} />;
      case 'importWallet':
        return <ImportWallet onSuccess={() => setScreen('walletList')} />;
      default:
        return null;
    }
  }, [screen, onReset]);

  return (
    <div className="flex flex-col gap-4 pb-16">
      {!!screen && (
        <div className="absolute inset-0 bg-secondary z-10 py-16 px-8 border-4 border-grey-900 rounded-[11px]">
          <div onClick={onBackToSetting} className="absolute right-12 top-9 cursor-pointer">
            <CloseIcon />
          </div>
          {renderContent}
        </div>
      )}
      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          {settingMenu.map(({ label, helpText, onClick }) => {
            return (
              <div
                key={label}
                onClick={onClick}
                className="flex border-2 border-grey-900 py-6 px-9 rounded-[20px] justify-between items-center cursor-pointer">
                <div className="flex flex-col gap-2">
                  <h5 className="font-bold text-grey-900">{label}</h5>
                  <h6 className="text-grey-700">{helpText}</h6>
                </div>
                <CaretRightIcon />
              </div>
            );
          })}
        </div>
        <div className="flex flex-col px-4">
          <Button className="h-[43px] font-bold" onClick={disconnect}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

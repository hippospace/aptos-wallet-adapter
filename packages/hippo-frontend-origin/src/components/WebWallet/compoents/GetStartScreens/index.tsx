import Button from 'components/Button';
import useAptosWallet from 'hooks/useAptosWallet';
import { useState } from 'react';
import { LogoIcon } from 'resources/icons';
import CreateWallet from './CreateWallet';
import WalletLogin from './WalletLogin';

const GetStartScreens: React.FC = () => {
  const { initialized } = useAptosWallet();
  const [screen, setScreen] = useState(initialized ? 'login' : '');

  if (screen === 'createWallet') {
    return <CreateWallet />;
  } else if (screen === 'login') {
    return <WalletLogin onCreateNew={() => setScreen('createWallet')} />;
  }

  return (
    <div className="flex flex-col items-center px-2 py-10">
      <LogoIcon className="mt-8" />
      <div className="mt-20 flex flex-col items-center text-center gap-4">
        <h4 className="text-grey-900 font-bold">Web Wallet at Hippo</h4>
        <div className="text-grey-900">
          To get started, create a new wallet or use one you already have.
        </div>
      </div>
      <div className="mt-[120px] flex flex-col items-center text-center gap-7 w-full px-4">
        <Button className="w-full font-bold" onClick={() => setScreen('createWallet')}>
          Create a new wallet
        </Button>
        <Button
          variant="outlined"
          className="w-full font-bold"
          onClick={() => setScreen('importWallet')}>
          I already have a wallet
        </Button>
      </div>
    </div>
  );
};

export default GetStartScreens;

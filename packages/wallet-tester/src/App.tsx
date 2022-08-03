import React, { useMemo } from 'react';
import {
  WalletProvider,
  // HippoWalletAdapter,
  AptosWalletAdapter,
  HippoExtensionWalletAdapter,
  MartianWalletAdapter,
  FewchaWalletAdapter
} from '@manahippo/aptos-wallet-adapter';
import MainPage from './pages';

const App: React.FC = () => {
  const wallets = useMemo(
    () => [
      // new HippoWalletAdapter(),
      new HippoExtensionWalletAdapter(),
      new MartianWalletAdapter(),
      new AptosWalletAdapter(),
      new FewchaWalletAdapter()
      // new MultiMaskWalletAdapter()
      // new NightlyWalletAdapter()
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      onError={(error: Error) => {
        console.log('Handle Error Message', error);
      }}>
      <MainPage />
    </WalletProvider>
  );
};

export default App;

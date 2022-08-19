import React, { useMemo } from 'react';
import {
  WalletProvider,
  // HippoWalletAdapter,
  AptosWalletAdapter,
  HippoExtensionWalletAdapter,
  MartianWalletAdapter,
  FewchaWalletAdapter,
  PontemWalletAdapter
} from '@manahippo/aptos-wallet-adapter';
import MainPage from './pages';
import { message } from 'antd';

const App: React.FC = () => {
  const wallets = useMemo(
    () => [
      // new HippoWalletAdapter(),
      new HippoExtensionWalletAdapter(),
      new MartianWalletAdapter(),
      new AptosWalletAdapter(),
      new FewchaWalletAdapter(),
      new PontemWalletAdapter()
      // new MultiMaskWalletAdapter()
      // new NightlyWalletAdapter()
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      onError={(error: Error) => {
        console.log('wallet errors: ', error);
        message.error(error.message);
      }}>
      <MainPage />
    </WalletProvider>
  );
};

export default App;

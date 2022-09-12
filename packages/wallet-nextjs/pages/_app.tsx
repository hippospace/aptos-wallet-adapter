import '../styles/globals.css';
import 'antd/dist/antd.css';
import type { AppProps } from 'next/app';
import {
  HippoExtensionWalletAdapter,
  MartianWalletAdapter,
  AptosWalletAdapter,
  FewchaWalletAdapter,
  WalletProvider,
  PontemWalletAdapter,
  SpikaWalletAdapter
} from '@manahippo/aptos-wallet-adapter';
import { useMemo } from 'react';
import { message } from 'antd';

function MyApp({ Component, pageProps }: AppProps) {
  const wallets = useMemo(
    () => [
      // new HippoWalletAdapter(),
      new HippoExtensionWalletAdapter(),
      new MartianWalletAdapter(),
      new AptosWalletAdapter(),
      new FewchaWalletAdapter(),
      new PontemWalletAdapter(),
      new SpikaWalletAdapter()
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
      <Component {...pageProps} />
    </WalletProvider>
  );
}

export default MyApp;

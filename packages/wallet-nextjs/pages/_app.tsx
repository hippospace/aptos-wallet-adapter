import '../styles/globals.css';
import 'antd/dist/antd.css';
import type { AppProps } from 'next/app';
import { WalletProvider, WalletAdapterNetwork } from '@manahippo/aptos-wallet-adapter';
import { PetraWalletAdapter } from '@manahippo/aptos-wallet-petra';
import { MartianWalletAdapter } from '@manahippo/aptos-wallet-martian';
import { HyperPayWalletAdapter } from '@manahippo/aptos-wallet-hyperPay';
import { FewchaWalletAdapter } from '@manahippo/aptos-wallet-fewcha';
import { PontemWalletAdapter } from '@manahippo/aptos-wallet-pontem';
import { RiseWalletAdapter } from '@manahippo/aptos-wallet-rise';
import { SpikaWalletAdapter } from '@manahippo/aptos-wallet-spika';
import { FletchWalletAdapter } from '@manahippo/aptos-wallet-fletch';
import { AptosSnapAdapter } from '@manahippo/aptos-wallet-aptossnap';
import { NightlyWalletAdapter } from '@manahippo/aptos-wallet-nightly';
import { BitkeepWalletAdapter } from '@manahippo/aptos-wallet-bitkeep';
import { TokenPocketWalletAdapter } from '@manahippo/aptos-wallet-tokenpocket';
import { BloctoWalletAdapter } from '@manahippo/aptos-wallet-blocto';
import { ONTOWalletAdapter } from '@manahippo/aptos-wallet-onto';
import { FoxWalletAdapter } from '@manahippo/aptos-wallet-fox';
import { OpenBlockWalletAdapter } from '@manahippo/aptos-wallet-openblock';
import { CloverWalletAdapter } from '@manahippo/aptos-wallet-clover';
import { Coin98WalletAdapter } from '@manahippo/aptos-wallet-coin98';
import { SpacecyWalletAdapter } from '@manahippo/aptos-wallet-spacecy';
import { useMemo } from 'react';
import { message } from 'antd';

function MyApp({ Component, pageProps }: AppProps) {
  const wallets = useMemo(
    () => [
      // new HippoWalletAdapter(),
      new MartianWalletAdapter(),
      new PetraWalletAdapter(),
      new FewchaWalletAdapter(),
      new PontemWalletAdapter(),
      new SpikaWalletAdapter(),
      new FletchWalletAdapter(),
      new AptosSnapAdapter(),
      new NightlyWalletAdapter(),
      new BitkeepWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new BloctoWalletAdapter({
        network: WalletAdapterNetwork.Testnet,
        bloctoAppId: '6d85f56e-5f2e-46cd-b5f2-5cf9695b4d46'
      }),
      new Coin98WalletAdapter(),
      new FoxWalletAdapter(),
      new OpenBlockWalletAdapter()
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

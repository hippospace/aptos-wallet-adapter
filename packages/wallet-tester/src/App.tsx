import React, { useEffect, useMemo, useState } from 'react';
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

import { Col, message, Row, Switch, Typography } from 'antd';
import MainPage from './pages';

const App: React.FC = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const autoConnect = queryParams.get('autoConnect')?.toLowerCase() === 'true' ? true : false;
  const [auto, setAuto] = useState(autoConnect);

  useEffect(() => {
    const url = new URL(window.location as any);
    url.searchParams.set('autoConnect', auto ? 'true' : 'false');
    window.history.pushState({}, '', url);
  }, [auto]);

  const wallets = useMemo(
    () => [
      new HyperPayWalletAdapter(),
      new MartianWalletAdapter(),
      new PetraWalletAdapter(),
      new FewchaWalletAdapter(),
      new PontemWalletAdapter(),
      new RiseWalletAdapter(),
      new SpikaWalletAdapter(),
      new FletchWalletAdapter(),
      new AptosSnapAdapter(),
      new NightlyWalletAdapter(),
      new BitkeepWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new BloctoWalletAdapter({
        network: WalletAdapterNetwork.Testnet,
        bloctoAppId: 'f7e52efa-18c4-4984-981f-ef6da6837652'
      }),
      new ONTOWalletAdapter(),
      new FoxWalletAdapter(),
      new OpenBlockWalletAdapter(),
      new CloverWalletAdapter(),
      new Coin98WalletAdapter(),
      new SpacecyWalletAdapter()
    ],
    []
  );

  const onChange = (checked: boolean) => {
    setAuto(checked);
  };

  return (
    <WalletProvider
      wallets={wallets}
      autoConnect={auto}
      onError={(error: Error) => {
        console.log('wallet errors: ', error);
        message.error(error.message);
      }}>
      <Row gutter={8}>
        <Col>
          <Typography>Enable Auto Connect:</Typography>
        </Col>
        <Col>
          <Switch checked={auto} onChange={onChange} />
        </Col>
      </Row>
      <Row gutter={8}>
        <Col>
          <Typography>Auto Connect:</Typography>
        </Col>
        <Col>
          <Typography>{auto ? 'True' : 'False'}</Typography>
        </Col>
      </Row>
      <MainPage />
    </WalletProvider>
  );
};

export default App;

import React, { useEffect, useMemo, useState } from 'react';
import {
  WalletProvider,
  // HippoWalletAdapter,
  AptosWalletAdapter,
  HippoExtensionWalletAdapter,
  MartianWalletAdapter,
  FewchaWalletAdapter,
  PontemWalletAdapter,
  RiseWalletAdapter,
  SpikaWalletAdapter
} from '@manahippo/aptos-wallet-adapter';
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
      // new HippoWalletAdapter(),
      new HippoExtensionWalletAdapter(),
      new MartianWalletAdapter(),
      new AptosWalletAdapter(),
      new FewchaWalletAdapter(),
      new PontemWalletAdapter(),
      new RiseWalletAdapter(),
      new SpikaWalletAdapter()
      // new NightlyWalletAdapter()
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

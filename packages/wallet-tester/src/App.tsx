import React, { useEffect, useMemo, useState } from 'react';
import {
  WalletProvider,
  HyperPayWalletAdapter,
  AptosWalletAdapter,
  HippoExtensionWalletAdapter,
  MartianWalletAdapter,
  FewchaWalletAdapter,
  PontemWalletAdapter,
  RiseWalletAdapter,
  SpikaWalletAdapter,
  FletchWalletAdapter,
  AptosSnapAdapter,
  NightlyWalletAdapter,
  BitkeepWalletAdapter,
  TokenPocketWalletAdapter,
  BloctoWalletAdapter,
  WalletAdapterNetwork,
  ONTOWalletAdapter,
  FoxWalletAdapter,
  OpenBlockWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  SpacecyWalletAdapter
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
      new HyperPayWalletAdapter(),
      new HippoExtensionWalletAdapter(),
      new MartianWalletAdapter(),
      new AptosWalletAdapter(),
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

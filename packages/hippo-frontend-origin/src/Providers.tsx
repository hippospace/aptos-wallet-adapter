import { Provider as ReduxProvider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';
import { ErrorBoundary } from 'components';
import reducer from 'modules/rootReducer';
import { AptosWalletProvider } from 'contexts/AptosWalletProvider';
import { HippoClientProvider } from 'contexts/HippoClientProvider';
import {
  WalletProvider,
  HippoWalletAdapter,
  AptosWalletAdapter,
  HippoExtensionWalletAdapter
} from '@manahippo/aptos-wallet-adapter';
import { useMemo } from 'react';

const isDevelopmentMode = process.env.NODE_ENV === 'development';

const store = configureStore({
  reducer,
  devTools: isDevelopmentMode,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: {
        ignoredPaths: ['connection']
      }
    }).concat(isDevelopmentMode ? [logger] : [])
});

type TProps = {
  children: any;
};

const Providers: React.FC<TProps> = (props: TProps) => {
  const wallets = useMemo(
    () => [
      new HippoWalletAdapter(),
      // new MartianWalletAdapter(),
      new AptosWalletAdapter(),
      // new MultiMaskWalletAdapter()
      new HippoExtensionWalletAdapter()
    ],
    []
  );

  return (
    <ErrorBoundary>
      <WalletProvider wallets={wallets}>
        <AptosWalletProvider>
          <HippoClientProvider>
            <ReduxProvider store={store}>{props.children}</ReduxProvider>
          </HippoClientProvider>
        </AptosWalletProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
};

export default Providers;

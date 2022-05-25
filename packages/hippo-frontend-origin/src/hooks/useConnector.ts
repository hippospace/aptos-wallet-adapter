// import { AbstractConnector } from '@web3-react/abstract-connector';
// import { useSelector } from 'react-redux';
// import {
//   getInjectedConnector,
//   getWalletConnectConnector,
//   getWalletlinkConnector
// } from 'utils/web3';
// import { getSupportedChainIds } from 'modules/common/reducer';
// import { CHAIN_RPC_URLS } from 'config/chains';

interface IWalletInfo {
  connector: any;
  name: string;
  mobile?: true;
  mobileOnly?: true;
}

function useConnector() {
  // const supportedChainIds = useSelector(getSupportedChainIds);
  // const defaultChainRpcUrls = CHAIN_RPC_URLS(supportedChainIds.length <= 1 ? 1 : 97);

  const SUPPORTED_WALLETS: { [key: string]: IWalletInfo } = {
    // Phantom: {
    //   connector: '',
    //   name: 'Phantom'
    // },
    // METAMASK: {
    //   connector: '',
    //   name: 'MetaMask'
    // },
    // WALLET_LINK: {
    //   connector: '',
    //   name: 'Coinbase Wallet'
    // },
    // WALLET_CONNECT: {
    //   connector: '',
    //   name: 'Wallet Connect'
    // },
    APTOS: {
      connector: '',
      name: 'Aptos'
    }
  };

  return {
    // defaultChainRpcUrls,
    SUPPORTED_WALLETS
  };
}

export default useConnector;

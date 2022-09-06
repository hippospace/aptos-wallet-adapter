import { AptosClient, FaucetClient } from 'aptos';

export const WEBWALLET_URL = 'https://hippo-wallet-test.web.app';
// export const WEBWALLET_URL = 'http://localhost:3030';

export const LOCAL_NODE_URL = 'http://127.0.0.1:8080';
export const DEVNET_NODE_URL = 'https://fullnode.devnet.aptoslabs.com/v1';
export const LOCAL_FAUCET_URL = 'http://127.0.0.1:8081';
export const DEVNET_FAUCET_URL = 'https://faucet.devnet.aptoslabs.com';

export const NODE_URL = DEVNET_NODE_URL;
export const FAUCET_URL = DEVNET_FAUCET_URL;

export const aptosClient = new AptosClient(NODE_URL);
export const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

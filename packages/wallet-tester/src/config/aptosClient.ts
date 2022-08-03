import { AptosClient } from 'aptos';
import { FaucetClient } from 'aptos/dist/faucet_client';
import { NODE_URL, FAUCET_URL } from './aptosConstants';

export const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

export const aptosClient = new AptosClient(NODE_URL);

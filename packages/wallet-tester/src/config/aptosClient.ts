import { FaucetClient, AptosClient } from 'aptos';
import { NODE_URL, FAUCET_URL } from './aptosConstants';

export const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

export const aptosClient = new AptosClient(NODE_URL);

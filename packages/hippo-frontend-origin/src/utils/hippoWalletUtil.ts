import { AptosClient } from 'aptos';
import { CONFIGS } from '@manahippo/hippo-sdk/src';
import { NODE_URL } from 'config/aptosConstants';

export const readConfig = () => {
  // const privateKey = new HexString(privateKeyStr);
  const isDevnet = true;
  const netConf = isDevnet ? CONFIGS.devnet : CONFIGS.localhost;
  const contractAddress = netConf.contractAddress;
  const client = new AptosClient(NODE_URL);
  // const account = new AptosAccount(privateKey.toUint8Array());
  // console.log(`Using address ${account.address().hex()}`);
  return { client, contractAddress, netConf };
};

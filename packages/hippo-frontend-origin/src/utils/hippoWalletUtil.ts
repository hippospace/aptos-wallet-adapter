import { CONFIGS } from '@manahippo/hippo-sdk';
import { AptosAccount, AptosClient, Types } from 'aptos';

export const readConfig = () => {
  const isDevnet = true;
  const netConf = isDevnet ? CONFIGS.devnet : CONFIGS.localhost;
  const contractAddress = netConf.contractAddress;
  return { contractAddress, netConf };
};

export async function sendPayloadTx(
  client: AptosClient,
  account: AptosAccount,
  payload: Types.TransactionPayload,
  max_gas = 1000
) {
  const txnRequest = await client.generateTransaction(account.address(), payload, {
    max_gas_amount: `${max_gas}`
  });
  const signedTxn = await client.signTransaction(account, txnRequest);
  const txnResult = await client.submitTransaction(signedTxn);
  await client.waitForTransaction(txnResult.hash);
  const txDetails = (await client.getTransaction(txnResult.hash)) as Types.UserTransaction;
  console.log(txDetails);
}

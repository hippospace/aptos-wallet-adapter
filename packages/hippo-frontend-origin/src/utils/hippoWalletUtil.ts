import { getTypeTagFullname, StructTag, TypeTag } from '@manahippo/aptos-tsgen';
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

export const getJointName = (xTag: TypeTag, yTag: TypeTag) => {
  if (!(xTag instanceof StructTag)) {
    throw new Error(`Expected xTag to be StructTag but received: ${JSON.stringify(xTag)}`);
  }
  if (!(yTag instanceof StructTag)) {
    throw new Error(`Expected yTag to be StructTag but received: ${JSON.stringify(yTag)}`);
  }
  const [xFullname, yFullname] = [xTag, yTag].map(getTypeTagFullname);
  return `${xFullname}/${yFullname}`;
};

import { HippoSwapClient, HippoWalletClient } from '@manahippo/hippo-sdk';
import { getProjectRepo } from '@manahippo/hippo-sdk/';
import { ActiveAptosWallet } from 'types/aptos';
import { readConfig } from 'utils/hippoWalletUtil';
import { aptosClient } from './aptosClient';

export const hippoWalletClient = async (account: ActiveAptosWallet) => {
  if (!account) return undefined;
  const { netConf } = readConfig();
  const repo = getProjectRepo();
  const walletClient = await HippoWalletClient.createInTwoCalls(
    netConf,
    aptosClient,
    repo,
    account
  );

  return walletClient;
};

export const hippoSwapClient = async () => {
  const { netConf } = readConfig();
  const repo = getProjectRepo();
  const swapClient = await HippoSwapClient.createInOneCall(netConf, aptosClient, repo);

  return swapClient;
};

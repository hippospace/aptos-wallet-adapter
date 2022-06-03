import { HippoWalletClient } from '@manahippo/hippo-sdk/src';
import { getParserRepo } from '@manahippo/hippo-sdk/src/generated/repo';
import { AptosAccountState } from 'types/aptos';
import { readConfig } from 'utils/hippoWalletUtil';

export const hippoWalletClient = async (account: AptosAccountState) => {
  if (!account) return undefined;
  const { client, netConf } = readConfig();
  const repo = getParserRepo();
  const walletClient = await HippoWalletClient.createInTwoCalls(
    netConf,
    client,
    repo,
    account.address()
  );

  return walletClient;
};

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { TransactionPayload } from 'aptos/dist/generated';
import { useWallet } from '@manahippo/aptos-wallet-adapter';
import { aptosClient, faucetClient } from '../config/aptosClient';
import { AptosAccount } from 'aptos';

const MainPage = () => {
  const [txLoading, setTxLoading] = useState(false);
  const [txLinks, setTxLinks] = useState<string[]>([]);
  const {
    connect,
    disconnect,
    account,
    wallets,
    signAndSubmitTransaction,
    connecting,
    connected,
    disconnecting
  } = useWallet();

  const renderWalletConnectorGroup = () => {
    return wallets.map((wallet) => {
      const option = wallet.adapter;
      return (
        <Button
          onClick={() => {
            connect(option.name);
          }}
          id={option.name.split(' ').join('_')}
          key={option.name}
          className="connect-btn">
          {option.name}
        </Button>
      );
    });
  };

  const transferToken = async () => {
    try {
      setTxLoading(true);
      if (account?.address || account?.publicKey) {
        const addressKey = account?.address?.toString() || account?.publicKey?.toString() || '';
        const demoAccount = new AptosAccount();
        await faucetClient.fundAccount(demoAccount.address(), 0);
        const payload: TransactionPayload = {
          type: 'script_function_payload',
          function: '0x1::coin::transfer',
          type_arguments: ['0x1::aptos_coin::AptosCoin'],
          arguments: [demoAccount.address().hex(), '717']
        };
        const payloadFewcha: TransactionPayload = {
          type: 'script_function_payload',
          function:
            '0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a::aggregatorv6::one_step_route',
          type_arguments: [
            '0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a::mock_coin::WBTC',
            '0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a::mock_coin::WUSDC',
            '0xb1d4c0de8bc24468608637dfdbff975a0888f8935aa63338a44078eec5c7b6c7::registry::E0'
          ],
          arguments: [2, 1, true, '1000000', '9900000000']
        };
        const payloadAptos: TransactionPayload = {
          type: 'script_function_payload',
          function:
            '0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a::aggregatorv6::one_step_route',
          type_arguments: [
            '0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a::mock_coin::WBTC',
            '0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a::mock_coin::WUSDC',
            '0xb1d4c0de8bc24468608637dfdbff975a0888f8935aa63338a44078eec5c7b6c7::registry::E0'
          ],
          arguments: [2, 1, true, '1000000', '9900000000']
        };
        const txnRequest = await aptosClient.generateTransaction(addressKey, payload);
        const transactionRes = await signAndSubmitTransaction(txnRequest.payload);
        await aptosClient.waitForTransaction(transactionRes?.hash || '');
        const links = [...txLinks, `https://explorer.devnet.aptos.dev/txn/${transactionRes?.hash}`];
        setTxLinks(links);
      }
    } catch (err: any) {
      console.log('tx error: ', err.msg);
    } finally {
      setTxLoading(false);
    }
  };

  const renderTxLinks = () => {
    return txLinks.map((link: string, index: number) => (
      <div className="flex gap-2 transaction" key={link}>
        <p>{index + 1}.</p>
        <a href={link} target="_blank" rel="noreferrer" className="underline">
          {link}
        </a>
      </div>
    ));
  };

  const renderContent = () => {
    if (connecting || disconnecting) {
      return <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />;
    }
    if (connected && account) {
      return (
        <div className="flex flex-col gap-2">
          <strong>
            Address: <div id="address">{account?.address?.toString()}</div>
          </strong>
          <strong>
            Public Key: <div id="publicKey">{account?.publicKey?.toString()}</div>
          </strong>
          <strong>
            AuthKey: <div id="authKey">{account?.authKey?.toString()}</div>
          </strong>
          <Button id="transferBtn" onClick={() => transferToken()} loading={txLoading}>
            Transfer Token
          </Button>
          <Button
            id="disconnectBtn"
            onClick={() => {
              setTxLinks([]);
              disconnect();
            }}>
            Disconnect
          </Button>
          <div className="mt-4">
            <h4>Transaction History:</h4>
            <div className="flex flex-col gap-2">{renderTxLinks()}</div>
          </div>
        </div>
      );
    } else {
      return <div className="flex flex-col gap-4">{renderWalletConnectorGroup()}</div>;
    }
  };
  return (
    <div className="w-full h-[100vh] flex justify-center items-center">
      <div className="flex justify-center">{renderContent()}</div>
    </div>
  );
};

export default MainPage;

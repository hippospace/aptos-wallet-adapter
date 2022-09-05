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
  const [txLoading, setTxLoading] = useState({
    sign: false,
    transaction: false
  });
  const [txLinks, setTxLinks] = useState<string[]>([]);
  const [signature, setSignature] = useState<string>('');
  const {
    connect,
    disconnect,
    account,
    wallets,
    signAndSubmitTransaction,
    connecting,
    connected,
    disconnecting,
    wallet: currentWallet,
    signMessage
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
      setTxLoading({
        ...txLoading,
        transaction: true
      });
      if (account?.address || account?.publicKey) {
        const addressKey = account?.address?.toString() || account?.publicKey?.toString() || '';
        const demoAccount = new AptosAccount();
        await faucetClient.fundAccount(demoAccount.address(), 0);
        const payload: TransactionPayload = {
          type: 'entry_function_payload',
          function: '0x1::coin::transfer',
          type_arguments: ['0x1::aptos_coin::AptosCoin'],
          arguments: [
            demoAccount.address().hex(),
            ['Martian', 'Fewcha'].includes(currentWallet?.adapter?.name || '') ? 717 : '717'
          ]
        };
        // const txnRequest = await aptosClient.generateTransaction(addressKey, payload);
        const transactionRes = await signAndSubmitTransaction(payload);
        await aptosClient.waitForTransaction(transactionRes?.hash || '');
        const links = [...txLinks, `https://explorer.devnet.aptos.dev/txn/${transactionRes?.hash}`];
        setTxLinks(links);
      }
    } catch (err: any) {
      console.log('tx error: ', err.msg);
    } finally {
      setTxLoading({
        ...txLoading,
        transaction: false
      });
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

  const signMess = async () => {
    try {
      setTxLoading({
        ...txLoading,
        sign: true
      });
      if (account?.publicKey) {
        const addressKey = account?.publicKey?.toString() || '';
        const signedMessage = (await signMessage(`Hello from account ${addressKey}`)) as any;
        setSignature(signedMessage.signedMessage.toString());
      }
    } catch (err: any) {
      console.log('tx error: ', err.msg);
    } finally {
      setTxLoading({
        ...txLoading,
        sign: false
      });
    }
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
          <strong>Message to Sign : Hello from account {account?.publicKey?.toString()}</strong>
          {signature ? (
            <div className="flex gap-2 transaction">
              <strong>Signature: </strong>
              <textarea className="w-full" readOnly rows={4} value={signature} />
            </div>
          ) : (
            <Button id="signBtn" onClick={() => signMess()} loading={txLoading.sign}>
              Sign Message
            </Button>
          )}
          <Button id="transferBtn" onClick={() => transferToken()} loading={txLoading.transaction}>
            Transfer Token
          </Button>
          <Button
            id="disconnectBtn"
            onClick={() => {
              setTxLinks([]);
              setSignature('');
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

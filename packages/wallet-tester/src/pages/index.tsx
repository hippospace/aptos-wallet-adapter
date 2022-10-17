/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Spin } from 'antd';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Types } from 'aptos';
import { SignMessageResponse, useWallet } from '@manahippo/aptos-wallet-adapter';
import { aptosClient, faucetClient } from '../config/aptosClient';
import { AptosAccount } from 'aptos';
import nacl from 'tweetnacl';

const MainPage = () => {
  const [txLoading, setTxLoading] = useState({
    sign: false,
    signTx: false,
    transaction: false,
    faucet: false
  });
  const queryParams = new URLSearchParams(window.location.search);
  const autoConnect = queryParams.get('autoConnect')?.toLowerCase() === 'true' ? true : false;

  const [txLinks, setTxLinks] = useState<string[]>([]);
  const [txSignLinks, setSignLinks] = useState<string[]>([]);
  const [faucetTxLinks, setFaucetTxLinks] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | SignMessageResponse>('');
  const [verified, setverified] = useState<boolean>(false);
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
    signMessage,
    signTransaction,
    select,
    network
  } = useWallet();

  useEffect(() => {
    if (!autoConnect && currentWallet?.adapter) {
      connect();
    }
  }, [autoConnect, currentWallet, connect]);

  const renderWalletConnectorGroup = () => {
    return wallets.map((wallet) => {
      const option = wallet.adapter;
      return (
        <Button
          onClick={() => {
            select(option.name);
          }}
          id={option.name.split(' ').join('_')}
          key={option.name}
          className="connect-btn">
          {option.name}
        </Button>
      );
    });
  };

  const signTransac = async () => {
    try {
      setTxLoading({
        ...txLoading,
        signTx: true
      });
      if (account?.address || account?.publicKey) {
        const addressKey = account?.address?.toString() || account?.publicKey?.toString() || '';
        const demoAccount = new AptosAccount();
        await faucetClient.fundAccount(demoAccount.address(), 0);
        const payload: Types.TransactionPayload = {
          type: 'entry_function_payload',
          function: '0x1::coin::transfer',
          type_arguments: ['0x1::aptos_coin::AptosCoin'],
          arguments: [
            demoAccount.address().hex(),
            ['Fewcha'].includes(currentWallet?.adapter?.name || '') ? 717 : '717'
          ]
        };
        const transactionRes = await signTransaction(payload);
        console.log('test sign transaction: ', transactionRes);
      }
    } catch (err: any) {
      console.log('tx error: ', err.msg);
    } finally {
      setTxLoading({
        ...txLoading,
        signTx: false
      });
    }
  };

  const transferToken = async () => {
    try {
      setTxLoading({
        ...txLoading,
        transaction: true
      });
      const txOptions = {
        max_gas_amount: '1000',
        gas_unit_price: '100'
      };
      if (account?.address || account?.publicKey) {
        const demoAccount = new AptosAccount();
        await faucetClient.fundAccount(demoAccount.address(), 0);
        const payload: Types.TransactionPayload = {
          type: 'entry_function_payload',
          function: '0x1::coin::transfer',
          type_arguments: ['0x1::aptos_coin::AptosCoin'],
          arguments: [
            demoAccount.address().hex(),
            ['Fewcha'].includes(currentWallet?.adapter?.name || '') ? 717 : '717'
          ]
        };
        const transactionRes = await signAndSubmitTransaction(payload, txOptions);
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

  const renderSignTxLinks = () => {
    return txSignLinks.map((link: string, index: number) => (
      <div className="flex gap-2 signedTx" key={link}>
        <p>{index + 1}.</p>
        <a href={link} target="_blank" rel="noreferrer" className="underline">
          {link}
        </a>
      </div>
    ));
  };

  const renderFaucetTxLinks = () => {
    return faucetTxLinks.map((link: string, index: number) => (
      <div className="flex gap-2 faucet" key={link}>
        <p>{index + 1}.</p>
        <a href={link} target="_blank" rel="noreferrer" className="underline">
          {link}
        </a>
      </div>
    ));
  };

  const messageToSign = useMemo(
    () =>
      `Hello from account ${account?.publicKey?.toString() || account?.address?.toString() || ''}`,
    [account]
  );

  const signMess = async () => {
    try {
      setTxLoading({
        ...txLoading,
        sign: true
      });
      const nonce = 'random_string';
      const msgPayload = [
        'pontem',
        'petra',
        'martian',
        'fewcha',
        'rise wallet',
        'snap',
        'bitkeep',
        'tokenpocket'
      ].includes(currentWallet?.adapter?.name?.toLowerCase() || '')
        ? {
            message: messageToSign,
            nonce
          }
        : messageToSign;
      const signedMessage = await signMessage(msgPayload);
      const response = typeof signedMessage === 'string' ? signedMessage : signedMessage.signature;
      setSignature(response);
      if (typeof signedMessage !== 'string') {
        const { publicKey } = account;
        const key = publicKey!.toString().slice(2, 66);
        setverified(
          nacl.sign.detached.verify(
            Buffer.from(signedMessage.fullMessage),
            Buffer.from(signedMessage.signature, 'hex'),
            Buffer.from(key, 'hex')
          )
        );
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

  const fundAccount = async () => {
    try {
      setTxLoading({
        ...txLoading,
        faucet: true
      });
      if (account?.address) {
        const transactionRes = await faucetClient.fundAccount(account.address, 50000);
        await aptosClient.waitForTransaction(`0x${transactionRes[0]}` || '');
        const links = [
          ...faucetTxLinks,
          `https://explorer.devnet.aptos.dev/txn/0x${transactionRes[0]}`
        ];
        setFaucetTxLinks(links);
      }
    } catch (err: any) {
      console.log('tx error: ', err.msg);
    } finally {
      setTxLoading({
        ...txLoading,
        faucet: false
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
            Wallet: <div id="address">{currentWallet?.adapter.name}</div>
          </strong>
          <strong>
            Address: <div id="address">{account?.address?.toString()}</div>
          </strong>
          <strong>
            Public Key: <div id="publicKey">{account?.publicKey?.toString()}</div>
          </strong>
          <strong>
            AuthKey: <div id="authKey">{account?.authKey?.toString()}</div>
          </strong>
          <strong>
            Network: <div id="network">{network.name}</div>
          </strong>
          <strong>
            ChainId: <div id="chainId">{network.chainId}</div>
          </strong>
          <strong>
            API: <div id="api">{network.api}</div>
          </strong>
          <strong>Message to Sign : {messageToSign}</strong>
          {signature ? (
            <Fragment>
              <div className="flex gap-2 transaction">
                <strong>Signature: </strong>
                <textarea
                  className="w-full"
                  readOnly
                  rows={4}
                  value={typeof signature !== 'string' ? signature.address : signature}
                />
              </div>
              <div className="flex gap-2 transaction">
                <strong>Verified: </strong>
                <input className="w-full" readOnly value={`${verified}`} />
              </div>
            </Fragment>
          ) : (
            <Button id="signBtn" onClick={() => signMess()} loading={txLoading.sign}>
              Sign Message
            </Button>
          )}
          {/* <Button id="signTransacBtn" onClick={() => signTransac()} loading={txLoading.signTx}>
            Sign Transaction
          </Button> */}
          <Button id="transferBtn" onClick={() => transferToken()} loading={txLoading.transaction}>
            Transfer Token
          </Button>
          <Button id="faucetBtn" onClick={() => fundAccount()} loading={txLoading.faucet}>
            Faucet
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
          {/* <div className="mt-4">
            <h4>Sign Tx History:</h4>
            <div className="flex flex-col gap-2">{renderSignTxLinks()}</div>
          </div> */}
          <div className="mt-4">
            <h4>Faucet History:</h4>
            <div className="flex flex-col gap-2">{renderFaucetTxLinks()}</div>
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

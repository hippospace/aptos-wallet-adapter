import { UserTransactionRequest } from 'aptos/dist/api/data-contracts';
import { message } from 'components/Antd';
import { WEBWALLET_URL } from 'config/aptosConstants';
import useHippoClient from 'hooks/useHippoClient';
import { useCallback, useEffect } from 'react';

interface TProps {
  className?: string;
}

const TransactionModal: React.FC<TProps> = () => {
  const { transaction, setTransaction } = useHippoClient();

  const onCancel = useCallback(() => setTransaction(undefined), [setTransaction]);

  const messageHandler = useCallback(
    (e: MessageEvent<Record<string, any>>) => {
      if (e.origin === WEBWALLET_URL) {
        if (e.data.method === 'disconnected') {
          onCancel();
        } else if (e.data.method === 'success') {
          transaction?.callback();
          message.success('Transaction Success');
        } else if (e.data.method === 'fail') {
          message.error(e.data.error);
        }
      }
      return true;
    },
    [onCancel, transaction]
  );

  useEffect(() => {
    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, [messageHandler]);

  const createRequest = useCallback((tx: UserTransactionRequest) => {
    const request = new URLSearchParams({
      request: JSON.stringify({ method: 'signTransaction', request: tx }),
      origin: window.location.origin
    }).toString();
    window.open(
      `${WEBWALLET_URL}?${request}`,
      'Transaction Confirmation',
      'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=440,height=700'
    );
  }, []);

  useEffect(() => {
    if (transaction) createRequest(transaction.transaction);
  }, [transaction]);

  return null;
};

export default TransactionModal;

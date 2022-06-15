import { message } from 'components/Antd';
import HippoModal from 'components/HippoModal';
import { WEBWALLET_URL } from 'config/aptosConstants';
import useHippoClient from 'hooks/useHippoClient';
import { useCallback, useEffect, useMemo } from 'react';
import { CloseIcon } from 'resources/icons';
import styles from './TransactionModal.module.scss';

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
          message.success('Swap successfully');
        } else if (e.data.method === 'fail') {
          console.log('it is error', e.data, e);
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

  const paresdRequest = useMemo(
    () =>
      transaction
        ? new URLSearchParams({
            request: JSON.stringify(transaction.transaction)
          }).toString()
        : '',
    [transaction]
  );

  return (
    <HippoModal
      onCancel={onCancel}
      className={styles.modal}
      destroyOnClose
      visible={!!transaction}
      footer={null}
      maskClosable={false}
      closeIcon={<CloseIcon />}>
      <iframe
        loading="lazy"
        id="transactionModal"
        src={`${WEBWALLET_URL}?${paresdRequest}`}
        width="440"
        height="700"
      />
    </HippoModal>
  );
};

export default TransactionModal;

import { ScriptFunctionPayload } from 'aptos/dist/api/data-contracts';
import { Collapse } from 'components/Antd';
import Button from 'components/Button';
import HippoModal from 'components/HippoModal';
import LogoIcon from 'components/LogoIcon';
import useAptosWallet from 'hooks/useAptosWallet';
import useHippoClient from 'hooks/useHippoClient';
import { useMemo, useState } from 'react';
import { CloseIcon } from 'resources/icons';
import { TTransaction } from 'types/hippo';
import { walletAddressEllipsis } from 'utils/utility';
import styles from './TransactionModal.module.scss';

interface TProps {
  className?: string;
}

const TransactionModal: React.FC<TProps> = ({ className }) => {
  const { transaction, setTransaction } = useHippoClient();
  const [loading, setLoading] = useState(false);
  const { activeWallet } = useAptosWallet();
  const privateKeyObject = activeWallet?.aptosAccount?.toPrivateKeyObject();

  const onCancel = () => setTransaction({} as TTransaction);

  const handleOnClick = async () => {
    setLoading(true);
    if (transaction?.callback) await transaction?.callback(transaction);
    setLoading(false);
  };

  const renderTransactionDetail = useMemo(() => {
    if (!transaction) return null;
    const { payload, transactionInfo } = transaction;
    if (payload && (payload as ScriptFunctionPayload).function) {
      const [address, moduleName, functionName] = (
        payload as ScriptFunctionPayload
      ).function?.split('::');
      return (
        <div className="bg-primary rounded-xl p-4 w-full">
          <div className="w-full flex justify-between">
            <div className="font-bold text-grey-900">Contract Address</div>
            <div className="font-bold text-grey-900">{walletAddressEllipsis(address)}</div>
          </div>
          <div className="w-full flex justify-between">
            <div className="font-bold text-grey-900">Contract Method</div>
            <div className="font-bold text-grey-900">
              {moduleName}::{functionName}
            </div>
          </div>
          <Collapse defaultActiveKey={['1']} ghost expandIconPosition="right">
            <Collapse.Panel
              className={styles.collapse}
              header={<div className="font-bold text-grey-900">Details</div>}
              key="1">
              {Object.keys(transactionInfo).map((key) => (
                <div key={key} className="w-full flex justify-between">
                  <p>{key}</p>
                  <p>{transactionInfo[key]}</p>
                </div>
              ))}
            </Collapse.Panel>
          </Collapse>
        </div>
      );
    }
  }, [transaction]);

  return (
    <HippoModal
      onCancel={onCancel}
      className={className}
      destroyOnClose
      // wrapClassName={styles.depositModal}
      visible={!!transaction?.type}
      footer={null}
      maskClosable={false}
      closeIcon={<CloseIcon />}>
      <div className="flex flex-col items-center gap-10">
        <h5 className="font-bold text-grey-900">
          {transaction?.type} ({walletAddressEllipsis(privateKeyObject?.address || '')})
        </h5>
        <div className="w-full flex flex-col items-center">
          <LogoIcon className="mt-8 w-[120px] h-[120px]" />
          <h4 className="font-bold text-grey-900 my-8">Transaction Confirmation</h4>
          {renderTransactionDetail}
        </div>
        <div className="flex w-full justify-between gap-10">
          <Button variant="outlined" className="flex-grow font-bold" onClick={onCancel}>
            <h6 className="text-inherit">Cancel</h6>
          </Button>
          <Button
            type="submit"
            className="flex-grow font-bold"
            onClick={handleOnClick}
            isLoading={loading}>
            <h6 className="text-inherit">Confirm</h6>
          </Button>
        </div>
      </div>
    </HippoModal>
  );
};

export default TransactionModal;

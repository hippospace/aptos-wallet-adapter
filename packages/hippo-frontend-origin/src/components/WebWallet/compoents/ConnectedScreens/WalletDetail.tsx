import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { useFormik } from 'formik';
import useAptosWallet from 'hooks/useAptosWallet';
import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { CopyIcon } from 'resources/icons';
import * as yup from 'yup';

interface TFormProps {
  walletName: string;
  privateKey: string;
}

interface TProps {
  onSuccess: () => void;
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const WalletDetailSchema = yup.object({
  walletName: yup.string().required(),
  privateKey: yup.string().required()
});

const WalletDetail: React.FC<TProps> = ({ onSuccess }) => {
  const { walletList, storeEncryptedWallet, activeWallet } = useAptosWallet();
  const privateKeyObject = activeWallet?.aptosAccount?.toPrivateKeyObject();
  const [copied, setCopied] = useState(false);

  const handleOnClickCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(() => false), 2000);
  };

  const onSubmit = async (values: TFormProps) => {
    try {
      const { walletName, privateKey } = values;
      if (!activeWallet) throw new Error('Please re-authenticate');
      const walletWithSameName = walletList.find(
        (wallet) =>
          wallet.walletName.includes(walletName) &&
          wallet.aptosAccountObj.privateKeyHex !== privateKey
      );
      if (walletWithSameName) {
        formik.setFieldError('walletName', 'Wallet name is used');
        return false;
      }
      if (privateKeyObject) {
        console.log('MEMEME>>>');
        const otherWallets =
          walletList.filter(
            (wallet) =>
              wallet.walletName.includes(walletName) &&
              wallet.aptosAccountObj.privateKeyHex === privateKey
          ) || [];
        storeEncryptedWallet({
          updatedWalletList: [...otherWallets, { walletName, aptosAccountObj: privateKeyObject }]
        });
      }
      onSuccess();
    } catch (error) {
      console.log('update wallet password error:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      walletName: activeWallet?.walletName || '',
      privateKey: privateKeyObject?.privateKeyHex || ''
    },
    validationSchema: WalletDetailSchema,
    onSubmit
  });

  return (
    <form className="flex flex-col items-center w-full gap-10" onSubmit={formik.handleSubmit}>
      <div className="flex flex-col gap-2 items-center">
        <h3 className="text-grey-900 font-bold">Wallet Management</h3>
      </div>
      <div className="mt-2 flex flex-col items-center text-center gap-3 w-full">
        <Form.Item
          {...formItemLayout}
          className="w-full"
          label="Wallet Name"
          validateStatus={formik.errors.walletName ? 'error' : ''}
          help={formik.errors.walletName}>
          <TextInput
            name="walletName"
            placeholder="New WalletName"
            value={formik.values.walletName}
            onChange={formik.handleChange}
          />
        </Form.Item>
        <Form.Item {...formItemLayout} className="w-full" label="Private Key">
          <TextInput
            readOnly
            value={copied ? 'Copied' : formik.values.privateKey}
            suffix={
              <CopyToClipboard
                text={privateKeyObject?.privateKeyHex || ''}
                onCopy={() => handleOnClickCopy()}>
                <CopyIcon />
              </CopyToClipboard>
            }
          />
        </Form.Item>
        <div className="flex w-full justify-between mt-20">
          <Button variant="outlined" className="w-[230px] font-bold" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" className="w-[230px] font-bold">
            Update
          </Button>
        </div>
      </div>
    </form>
  );
};

export default WalletDetail;

import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { useFormik } from 'formik';
import useAptosWallet from 'hooks/useAptosWallet';
import { importAccount } from 'utils/aptosUtils';
import * as yup from 'yup';

interface TFormProps {
  privateKey: string;
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const importWalletSchema = yup.object({
  privateKey: yup.string().required()
});

interface TProps {
  onSuccess: () => void;
}

const ImportWallet: React.FC<TProps> = ({ onSuccess }) => {
  const { walletList, storeEncryptedWallet } = useAptosWallet();

  const onSubmit = async (values: TFormProps) => {
    try {
      const { privateKey } = values;
      const account = importAccount(privateKey);
      const privateKeyObject = account?.toPrivateKeyObject();
      const walletName = `wallet${walletList.length + 1}`;
      const updatedWalletList = [{ walletName, aptosAccountObj: privateKeyObject }, ...walletList];
      storeEncryptedWallet({ updatedWalletList });
      onSuccess();
    } catch (error) {
      console.log('import wallet error:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      privateKey: ''
    },
    validationSchema: importWalletSchema,
    onSubmit
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
      <h5>Import Wallet</h5>
      <Form.Item
        {...formItemLayout}
        className="w-full"
        label="Private Key"
        validateStatus={formik.errors.privateKey ? 'error' : ''}
        help={formik.errors.privateKey}>
        <TextInput
          name="privateKey"
          value={formik.values.privateKey}
          onChange={formik.handleChange}
        />
      </Form.Item>
      <Button type="submit">Import</Button>
    </form>
  );
};

export default ImportWallet;

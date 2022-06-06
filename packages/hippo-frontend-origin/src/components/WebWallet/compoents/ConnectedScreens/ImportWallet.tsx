import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { useFormik } from 'formik';
import useAptosWallet from 'hooks/useAptosWallet';
import { importAccount } from 'utils/aptosUtils';
import * as yup from 'yup';

interface TFormProps {
  privateKey: string;
  walletName: string;
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const importWalletSchema = yup.object({
  privateKey: yup.string().required(),
  walletName: yup.string().required()
});

interface TProps {
  onSuccess: () => void;
}

const ImportWallet: React.FC<TProps> = ({ onSuccess }) => {
  const { walletList, storeEncryptedWallet } = useAptosWallet();

  const onSubmit = async (values: TFormProps) => {
    try {
      const { privateKey, walletName } = values;
      const account = importAccount(privateKey);
      const privateKeyObject = account?.toPrivateKeyObject();
      const updatedWalletList = [{ walletName, aptosAccountObj: privateKeyObject }, ...walletList];
      storeEncryptedWallet({ updatedWalletList });
      onSuccess();
    } catch (error) {
      console.log('import wallet error:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      privateKey: '',
      walletName: `Wallet${walletList.length + 1}`
    },
    validationSchema: importWalletSchema,
    onSubmit
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={formik.handleSubmit}>
      <h4 className="text-grey-900 font-bold">Import Wallet</h4>
      <Form.Item
        {...formItemLayout}
        className="w-full"
        label="Wallet Name"
        validateStatus={formik.errors.walletName ? 'error' : ''}
        help={formik.errors.walletName}>
        <TextInput
          name="walletName"
          value={formik.values.walletName}
          onChange={formik.handleChange}
        />
      </Form.Item>
      <Form.Item
        {...formItemLayout}
        className="w-full"
        label="Private Key"
        validateStatus={formik.errors.privateKey ? 'error' : ''}
        help={formik.errors.privateKey}>
        <TextInput
          name="privateKey"
          placeholder="Private key"
          value={formik.values.privateKey}
          onChange={formik.handleChange}
        />
      </Form.Item>
      <div className="flex w-full justify-between mt-20">
        <Button variant="outlined" className="w-[230px] font-bold" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" className="w-[230px] font-bold">
          Confirm
        </Button>
      </div>
    </form>
  );
};

export default ImportWallet;

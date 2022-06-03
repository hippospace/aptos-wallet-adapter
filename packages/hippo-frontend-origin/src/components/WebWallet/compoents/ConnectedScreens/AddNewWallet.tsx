import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { faucetClient } from 'config/aptosClient';
import { useFormik } from 'formik';
import useAptosWallet from 'hooks/useAptosWallet';
import { useState } from 'react';
import { createNewAccount } from 'utils/aptosUtils';
import * as yup from 'yup';

interface TFormProps {
  walletName: string;
}

interface TProps {
  onSuccess: () => void;
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const createWalletSchema = yup.object({
  walletName: yup.string().required()
});

const AddNewWallet: React.FC<TProps> = ({ onSuccess }) => {
  const [isAccountBeingCreated, setIsAccountBeingCreated] = useState<boolean>(false);
  const { storeEncryptedWallet, walletList } = useAptosWallet();

  const onSubmit = async (values: TFormProps) => {
    try {
      const { walletName } = values;
      if (walletList.find((wallet) => wallet.walletName.includes(walletName))) {
        formik.setFieldError('walletName', 'Wallet name is used');
        return false;
      }
      setIsAccountBeingCreated(true);
      const account = createNewAccount();
      await faucetClient.fundAccount(account.address(), 0);
      // updateWalletState({ aptosAccountState: account, walletName });
      const privateKeyObject = account?.toPrivateKeyObject();
      const updatedWalletList = [{ walletName, aptosAccountObj: privateKeyObject }, ...walletList];
      storeEncryptedWallet({ updatedWalletList });
      setIsAccountBeingCreated(false);
      onSuccess();
    } catch (error) {
      console.log('create new wallet error:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      walletName: `Wallet${walletList.length + 1}`
    },
    validationSchema: createWalletSchema,
    onSubmit
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <h5>Create new account</h5>
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
      <Button isLoading={isAccountBeingCreated} type="submit">
        Create Account
      </Button>
    </form>
  );
};

export default AddNewWallet;

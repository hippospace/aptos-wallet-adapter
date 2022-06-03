import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { faucetClient } from 'config/faucetClient';
import { useFormik } from 'formik';
import useAptosWallet from 'hooks/useAptosWallet';
import { useState } from 'react';
import { createNewAccount } from 'utils/aptosUtils';
import * as yup from 'yup';

interface TFormProps {
  walletName: string;
  password: string;
  confirmPassword: string;
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const createWalletSchema = yup.object({
  walletName: yup.string().required(),
  password: yup.string().min(8, 'at least 8 characters').required(),
  confirmPassword: yup
    .string()
    .required()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
});

const CreateWallet: React.FC = () => {
  const [isAccountBeingCreated, setIsAccountBeingCreated] = useState<boolean>(false);
  const { storeEncryptedWallet, connectAccount, walletList } = useAptosWallet();

  const onSubmit = async (values: TFormProps) => {
    try {
      const { walletName, password } = values;
      setIsAccountBeingCreated(true);
      const account = createNewAccount();
      await faucetClient.fundAccount(account.address(), 0);
      const privateKeyObject = account?.toPrivateKeyObject();
      const updatedWalletList = [{ walletName, aptosAccountObj: privateKeyObject }, ...walletList];
      storeEncryptedWallet({ updatedWalletList, password });
      connectAccount(password);
      setIsAccountBeingCreated(false);
    } catch (error) {
      console.log('create new wallet error:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      walletName: 'Wallet1',
      password: '',
      confirmPassword: ''
    },
    validationSchema: createWalletSchema,
    onSubmit
  });

  return (
    <form className="flex flex-col items-center gap-6 w-full" onSubmit={formik.handleSubmit}>
      <h5>Create Password</h5>
      <Form.Item
        {...formItemLayout}
        className="w-full"
        label="New Password (8 characters min)"
        validateStatus={formik.errors.password ? 'error' : ''}
        help={formik.errors.password}>
        <TextInput
          type="password"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
        />
      </Form.Item>
      <Form.Item
        {...formItemLayout}
        className="w-full"
        label="Confirm password"
        validateStatus={formik.errors.confirmPassword ? 'error' : ''}
        help={formik.errors.confirmPassword}>
        <TextInput
          name="confirmPassword"
          type="password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
        />
      </Form.Item>
      <Button isLoading={isAccountBeingCreated} type="submit">
        Create Account
      </Button>
    </form>
  );
};

export default CreateWallet;

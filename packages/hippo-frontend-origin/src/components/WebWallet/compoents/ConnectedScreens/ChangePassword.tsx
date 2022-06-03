import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { useFormik } from 'formik';
import useAptosWallet from 'hooks/useAptosWallet';
import * as yup from 'yup';

interface TFormProps {
  password: string;
  confirmPassword: string;
}

interface TProps {
  onSuccess: () => void;
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const changePasswordSchema = yup.object({
  password: yup.string().min(8, 'at least 8 characters').required(),
  confirmPassword: yup
    .string()
    .required()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
});

const ChangePassword: React.FC<TProps> = ({ onSuccess }) => {
  const { walletList, storeEncryptedWallet } = useAptosWallet();
  const onSubmit = async (values: TFormProps) => {
    try {
      const { password } = values;
      if (!walletList || !walletList.length) throw new Error('Please re-authenticate');
      storeEncryptedWallet({ updatedWalletList: walletList, password });
      onSuccess();
    } catch (error) {
      console.log('update wallet password error:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema: changePasswordSchema,
    onSubmit
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <h5>Change Password</h5>
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
      <Button type="submit">Confirm</Button>
    </form>
  );
};

export default ChangePassword;

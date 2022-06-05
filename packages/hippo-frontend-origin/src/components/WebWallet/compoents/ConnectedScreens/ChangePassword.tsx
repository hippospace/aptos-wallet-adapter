import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { useFormik } from 'formik';
import useAptosWallet from 'hooks/useAptosWallet';
import { LockIcon } from 'resources/icons';
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
    <form className="flex flex-col items-center w-full gap-10" onSubmit={formik.handleSubmit}>
      <div className="flex flex-col gap-2 items-center">
        <LockIcon />
        <h3 className="text-grey-900 font-bold">Change Password</h3>
      </div>
      <div className="mt-2 flex flex-col items-center text-center gap-3 w-full">
        <Form.Item
          {...formItemLayout}
          className="w-full"
          // label="New Password (8 characters min)"
          validateStatus={formik.errors.password ? 'error' : ''}
          help={formik.errors.password}>
          <TextInput
            type="password"
            name="password"
            placeholder="New Password"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          className="w-full"
          // label="Confirm password"
          validateStatus={formik.errors.confirmPassword ? 'error' : ''}
          help={formik.errors.confirmPassword}>
          <TextInput
            name="confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
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

export default ChangePassword;

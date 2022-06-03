import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { useFormik } from 'formik';
import useAptosWallet from 'hooks/useAptosWallet';
import * as yup from 'yup';

interface TFormProps {
  password: string;
}

interface TProps {
  onCreateNew: () => void;
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const connectWalletSchema = yup.object({
  password: yup.string().required()
});

const WalletLogin: React.FC<TProps> = ({ onCreateNew }) => {
  const { connectAccount } = useAptosWallet();
  const onSubmit = async (values: TFormProps) => {
    try {
      const { password } = values;
      connectAccount(password);
    } catch (error) {
      console.log('create new wallet error:', error);
      if (error instanceof Error) {
        formik.setErrors({ password: error.message });
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      password: ''
    },
    validationSchema: connectWalletSchema,
    onSubmit
  });

  return (
    <form className="" onSubmit={formik.handleSubmit}>
      <h5>Wallet login</h5>
      <Form.Item
        {...formItemLayout}
        className="w-full"
        label="Password"
        validateStatus={formik.errors.password ? 'error' : ''}
        help={formik.errors.password}>
        <TextInput
          type="password"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
        />
      </Form.Item>
      <Button type="submit">Login</Button>
      <hr className="h-[2px] bg-[#D5D5D5] w-full my-4" />
      <div className="text-grey-900 font-bold cursor-pointer" onClick={onCreateNew}>
        Create or Import a wallet
      </div>
    </form>
  );
};

export default WalletLogin;

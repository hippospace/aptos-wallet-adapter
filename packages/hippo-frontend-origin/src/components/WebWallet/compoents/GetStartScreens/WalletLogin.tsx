import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { useFormik } from 'formik';
import useAptosWallet from 'hooks/useAptosWallet';
import { LogoIcon } from 'resources/icons';
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
    <form className="flex flex-col items-center px-9 py-10" onSubmit={formik.handleSubmit}>
      <LogoIcon className="mt-8 w-[120px] h-[120px]" width={120} height={120} />
      <div className="mt-10 flex flex-col items-center text-center gap-8 w-full">
        <h4 className="text-grey-900 font-bold">Enter Your Password</h4>
        <Form.Item
          {...formItemLayout}
          className="w-full"
          // label="Password"
          validateStatus={formik.errors.password ? 'error' : ''}
          help={formik.errors.password}>
          <TextInput
            type="password"
            name="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
        </Form.Item>
        <div className="w-full px-8">
          <Button type="submit" className="w-full font-bold">
            Unlock
          </Button>
        </div>
        {/* <hr className="h-[2px] bg-[#D5D5D5] w-full my-4" /> */}
        <div className="text-grey-900 font-bold cursor-pointer" onClick={onCreateNew}>
          Recover your master password
        </div>
      </div>
    </form>
  );
};

export default WalletLogin;

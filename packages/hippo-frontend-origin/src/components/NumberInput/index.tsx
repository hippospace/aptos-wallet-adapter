import { InputNumber, InputNumberProps } from 'components/Antd';

interface TProps extends InputNumberProps {
  className: string;
  // min?: number;
  // max?: number;
  // step?: string;
  // placeholder?: string;
  // stringMode?: boolean;
  // controls?: boolean;
}

const NumberInput: React.FC<TProps> = ({ className, ...rest }) => {
  return <InputNumber className={className} {...rest} />;
};

export default NumberInput;

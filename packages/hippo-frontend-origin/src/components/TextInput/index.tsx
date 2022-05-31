import cx from 'classnames';
import { InputProps, Input } from 'components/Antd';
import styles from './TextInput.module.scss';

interface TProps extends InputProps {
  className?: string;
}

const TextInput: React.FC<TProps> = ({ className, ...rest }) => {
  return (
    <div className={cx(styles.textInput, className)}>
      <Input {...rest} />
    </div>
  );
};

export default TextInput;

import cx from 'classnames';
import { Checkbox, CheckboxProps } from 'components/Antd';
import styles from './Checkbox.module.scss';

interface TProps extends CheckboxProps {
  className?: string;
}

const CheckboxInput: React.FC<TProps> = ({ className, ...rest }) => {
  return (
    <div className={cx(styles.checkbox, className)}>
      <Checkbox {...rest} />
    </div>
  );
};

export default CheckboxInput;

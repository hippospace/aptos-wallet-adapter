import cx from 'classnames';
import { Switch, SwitchProps } from 'components/Antd';
import styles from './Switch.module.scss';

interface TProps extends SwitchProps {
  className?: string;
}

const SwitchInput: React.FC<TProps> = ({ className, ...rest }) => {
  return (
    <div className={cx(styles.switch, className)}>
      <Switch {...rest} />
    </div>
  );
};

export default SwitchInput;

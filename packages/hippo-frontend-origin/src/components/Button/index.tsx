import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import cx from 'classnames';
import styles from './Button.module.scss';

type TProps = {
  className?: string;
  children?: any;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'solid' | 'outlined';
  type?: 'button' | 'submit' | 'reset' | undefined;
  onClick?: (e: React.MouseEvent<HTMLElement>) => {} | void;
};

const Button: React.FC<TProps> = (props) => {
  const {
    onClick = () => {},
    isLoading,
    className,
    disabled,
    children,
    variant = 'solid',
    ...rest
  } = props;

  return (
    <button
      className={cx(styles.button, className, {
        [styles.disabled]: disabled,
        [styles.loading]: isLoading,
        [styles.solid]: variant === 'solid',
        [styles.outlined]: variant === 'outlined'
      })}
      onClick={onClick}
      disabled={disabled}
      {...rest}>
      {children}
      {isLoading && (
        <LoadingOutlined style={{ color: 'currentColor', fontSize: 16 }} className="ml-2" />
      )}
    </button>
  );
};

export default Button;

import cx from 'classnames';
import { Input, InputProps } from 'components/Antd';
import { SearchIcon } from 'resources/icons';
import styles from './Input.module.scss';

interface TProps extends InputProps {
  className?: string;
}

const SearchInput: React.FC<TProps> = ({ className, ...rest }) => {
  return (
    <div className={cx(styles.input, className)}>
      <Input
        // className={cx(styles.input, className)}
        placeholder="Search"
        prefix={<SearchIcon className="opacity-80" />}
        {...rest}
      />
    </div>
  );
};

export default SearchInput;

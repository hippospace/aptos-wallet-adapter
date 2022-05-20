import cx from 'classnames';
import { Select, SelectProps } from 'components/Antd';
import { CaretIcon } from 'resources/icons';
import styles from './Select.module.scss';

interface OptionProps {
  label: string;
  value: string;
  disabled?: boolean;
}

interface TProps extends SelectProps {
  className?: string;
  options: OptionProps[];
}

const SelectInput: React.FC<TProps> = ({ className, options, ...rest }) => {
  return (
    <div className={cx(styles.select, className)}>
      <Select suffixIcon={<CaretIcon />} {...rest}>
        {options.map((option) => {
          const { label, value, ...rest } = option;
          return (
            <Select.Option value={value} {...rest} key={label}>
              {label}
            </Select.Option>
          );
        })}
      </Select>
    </div>
  );
};

export default SelectInput;

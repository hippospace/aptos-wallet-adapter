import cx from 'classnames';
import { Slider, SliderSingleProps } from 'components/Antd';
import styles from './SlideInput.module.scss';

interface TProps extends SliderSingleProps {
  className?: string;
}

const SlideInput: React.FC<TProps> = ({ className, ...rest }) => {
  return (
    <div className={cx(styles.slide, className)}>
      <Slider {...rest} />
    </div>
  );
};

export default SlideInput;

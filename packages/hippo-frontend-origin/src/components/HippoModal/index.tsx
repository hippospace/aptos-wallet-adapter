import { Modal, ModalProps } from 'components/Antd';
import cx from 'classnames';
import styles from './HippoModal.module.scss';

interface TProps extends ModalProps {
  className?: string;
}

const HippoModal: React.FC<TProps> = ({ className, ...rest }) => {
  return <Modal className={cx(styles.modal, className)} {...rest} />;
};

export default HippoModal;

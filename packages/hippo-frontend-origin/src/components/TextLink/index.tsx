import cx from 'classnames';
import { ReactNode } from 'react';

interface TProps {
  className?: string;
  href: string;
  alt?: string;
  onClick?: () => void;
  children: ReactNode | string;
}

const TextLink: React.FC<TProps> = ({ className, children, ...rest }) => {
  return (
    <a
      className={cx('helpText bold text-grey-900 underline', className)}
      {...rest}
      target="_blank"
      rel="noreferrer">
      {children}
    </a>
  );
};

export default TextLink;

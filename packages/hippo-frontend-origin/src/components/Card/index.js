import cx from 'classnames';

const Card = ({ children, className = '' }) => (
  <div className={cx(className, 'bg-secondary rounded-[20px] shadow-md')}>{children}</div>
);

export default Card;

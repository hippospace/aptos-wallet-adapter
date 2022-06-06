import cx from 'classnames';

const Card = ({ children, className = '' }) => (
  <div className={cx(className, 'bg-secondary rounded-xxl shadow-md')}>{children}</div>
);

export default Card;

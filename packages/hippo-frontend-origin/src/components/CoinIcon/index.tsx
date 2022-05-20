import cx from 'classnames';

interface TProps {
  logoSrc: string;
  className?: string;
}

const CoinIcon: React.FC<TProps> = ({ logoSrc, className }) => {
  return (
    <div className="w-6 h-6">
      <img src={logoSrc} className={cx(className, 'w-full h-full rounded-full')} alt="" />
    </div>
  );
};

export default CoinIcon;

import LogoImg from 'resources/img/hippo_logo.png';
import cx from 'classnames';

interface TProps {
  className: string;
}

const LogoIcon: React.FC<TProps> = ({ className }) => {
  return <img src={LogoImg} alt="hippo logo" className={cx(className, 'w-full h-full')} />;
};

export default LogoIcon;

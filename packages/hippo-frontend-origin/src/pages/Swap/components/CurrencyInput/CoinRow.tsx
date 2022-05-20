import CoinIcon from 'components/CoinIcon';
import { ITokenInfo } from 'types/tokenList';

interface TProps {
  item: ITokenInfo;
}

const CoinRow: React.FC<TProps> = ({ item }) => {
  return (
    <div className="flex items-center gap-4">
      <CoinIcon logoSrc={item.logoURI} />
      <div className="">
        <div className="title bold text-primary uppercase">{item.symbol}</div>
        <div className="helpText text-primeBlack80 font-semibold">{item.name}</div>
      </div>
      <div className="helpText text-primeBlack80 font-semibold">{item?.balance}</div>
    </div>
  );
};

export default CoinRow;

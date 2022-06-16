import CoinIcon from 'components/CoinIcon';
import { ITokenInfo } from 'types/tokenList';

interface TProps {
  item: ITokenInfo;
}

const CoinRow: React.FC<TProps> = ({ item }) => {
  return (
    <div className="flex items-center justify-between gap-2 border-2 border-grey-900 w-full p-2 hover:bg-primePurple-100">
      <div className="flex items-center gap-2">
        <CoinIcon logoSrc={item.logoURI} />
        <div className="">
          <div className="font-bold text-grey-900 uppercase">{item.symbol}</div>
          <small className="text-grey-500 font-bold">{item.name}</small>
        </div>
      </div>
      <small className="text-grey-700 font-bold">{item?.balance}</small>
    </div>
  );
};

export default CoinRow;

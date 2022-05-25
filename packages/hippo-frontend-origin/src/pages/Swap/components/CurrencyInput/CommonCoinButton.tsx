import Button from 'components/Button';
import CoinIcon from 'components/CoinIcon';
import { ITokenInfo } from 'types/tokenList';

interface TProps {
  coin: ITokenInfo;
  onClickToken: () => void;
}

const CommonCoinButton: React.FC<TProps> = ({ coin, onClickToken }) => {
  return (
    <Button variant="outlined" onClick={onClickToken} className="p-0 overflow-hidden rounded-full">
      <CoinIcon logoSrc={coin.logoURI} />
      {/* {coin.symbol} */}
    </Button>
  );
};

export default CommonCoinButton;

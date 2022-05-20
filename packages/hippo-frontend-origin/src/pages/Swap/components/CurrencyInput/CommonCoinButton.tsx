import Button from 'components/Button';
import CoinIcon from 'components/CoinIcon';
import { ITokenInfo } from 'types/tokenList';

interface TProps {
  coin: ITokenInfo;
  onClickToken: () => void;
}

const CommonCoinButton: React.FC<TProps> = ({ coin, onClickToken }) => {
  return (
    <Button
      variant="outlined"
      onClick={onClickToken}
      className="uppercase flex gap-2 border-[1px] rounded-[10px] border-primeBlack80 p-2 active:!bg-primeBlack focus:!bg-primeBlack">
      <CoinIcon logoSrc={coin.logoURI} />
      {coin.symbol}
    </Button>
  );
};

export default CommonCoinButton;

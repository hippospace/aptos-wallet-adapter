import Button from 'components/Button';
import Card from 'components/Card';
import { IPool } from 'types/pool';
import PoolInfo from './PoolInfo';
import TokenPair from './TokenPair';

interface TProps {
  pool?: IPool;
}

const PoolCard: React.FC<TProps> = ({ pool }) => {
  if (!pool) return null;
  return (
    <Card className="w-full py-6 px-9 flex justify-between items-center">
      <TokenPair token0={pool.token0} token1={pool.token1} />
      <PoolInfo pool={pool} />
      <hr className="w-[2px] h-[62px] bg-primeBlack20 mr-14" />
      <div className="flex gap-4">
        <Button
          variant="outlined"
          className="border-2 border-primary !text-primary paragraph bold active:!bg-primeBlack focus:!bg-primeBlack">
          Withdraw
        </Button>
        <Button className="paragraph bold">Deposit</Button>
      </div>
    </Card>
  );
};

export default PoolCard;

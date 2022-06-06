import Button from 'components/Button';
import Card from 'components/Card';
import useAptosWallet from 'hooks/useAptosWallet';
import { IPool } from 'types/pool';
import PoolInfo from './PoolInfo';
import TokenPair from './TokenPair';

interface TProps {
  pool?: IPool;
  onDeposit: () => void;
  onWithdraw: () => void;
}

const PoolCard: React.FC<TProps> = ({ pool, onDeposit, onWithdraw }) => {
  const { activeWallet, openModal } = useAptosWallet();
  if (!pool) return null;

  return (
    <Card className="w-full py-6 px-9 flex justify-between items-center border-4 border-grey-900 shadow-figma">
      <TokenPair token0={pool.token0} token1={pool.token1} />
      <PoolInfo pool={pool} />
      <hr className="w-[2px] h-[62px] bg-primeBlack20 mr-14" />
      <div className="flex gap-4">
        {!activeWallet ? (
          <Button className="paragraph bold" onClick={openModal}>
            Connect to Wallet
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={onWithdraw}
              className="border-2 border-primary !text-grey-900 paragraph bold active:!bg-primeBlack focus:!bg-primeBlack">
              Withdraw
            </Button>
            <Button className="paragraph bold" onClick={onDeposit}>
              Deposit
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default PoolCard;

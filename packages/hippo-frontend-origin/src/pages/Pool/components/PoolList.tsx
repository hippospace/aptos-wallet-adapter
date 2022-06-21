import { List } from 'antd';
import { IPool } from 'types/pool';
// import VirtualList from 'rc-virtual-list';
import PoolCard from './PoolCard';
// import { useSelector } from 'react-redux';
// import { getLayoutHeight } from 'modules/common/reducer';
import DepositModal from './DepositModal';
import { useState } from 'react';
import WithdrawModal from './WithdrawModal';
interface TProps {
  filteredPools: IPool[];
}

const PoolList: React.FC<TProps> = ({ filteredPools }) => {
  // const containerHeight = useSelector(getLayoutHeight);
  const [depositPair, setDepositPair] = useState<IPool>();
  const [withdrawPair, setWithdrawPair] = useState<IPool>();

  const handleOnClickDeposit = (item: IPool) => {
    setDepositPair(item);
  };

  const handleOnClickWithdraw = (item: IPool) => {
    setWithdrawPair(item);
  };
  return (
    <>
      <List className="h-full overflow-y-scroll no-scrollbar border-0">
        {filteredPools.map((item) => (
          <List.Item className="!border-b-0 !px-0 !pr-2" key={item.id}>
            <PoolCard
              pool={item}
              onDeposit={() => handleOnClickDeposit(item)}
              onWithdraw={() => handleOnClickWithdraw(item)}
            />
          </List.Item>
        ))}
      </List>
      <DepositModal tokenPair={depositPair} onDismissModal={() => setDepositPair(undefined)} />
      <WithdrawModal tokenPair={withdrawPair} onDismissModal={() => setWithdrawPair(undefined)} />
    </>
  );
};

export default PoolList;

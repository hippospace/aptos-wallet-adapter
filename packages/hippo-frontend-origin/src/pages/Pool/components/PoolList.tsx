import { List } from 'antd';
import { IPool } from 'types/pool';
import VirtualList from 'rc-virtual-list';
import PoolCard from './PoolCard';
import { useSelector } from 'react-redux';
import { getLayoutHeight } from 'modules/common/reducer';
import DepositModal from './DepositModal';
import { useState } from 'react';
import WithdrawModal from './WithdrawModal';
interface TProps {
  filteredPools: IPool[];
}

const PoolList: React.FC<TProps> = ({ filteredPools }) => {
  const containerHeight = useSelector(getLayoutHeight);
  const [depositPair, setDepositPair] = useState<IPool>();
  const [withdrawPair, setWithdrawPair] = useState<IPool>();

  const handleOnClickDeposit = (item: IPool) => {
    console.log('deposit>>>', item);
    setDepositPair(item);
  };

  const handleOnClickWithdraw = (item: IPool) => {
    console.log('withdraw>>>', item);
    setWithdrawPair(item);
  };
  return (
    <>
      <List className="h-full overflow-y-scroll border-0">
        <VirtualList
          data={filteredPools}
          height={containerHeight - 100}
          itemHeight={130}
          itemKey="tokenList">
          {(item) => (
            <List.Item className="!border-b-0 !px-0" key={item.id}>
              <PoolCard
                pool={item}
                onDeposit={() => handleOnClickDeposit(item)}
                onWithdraw={() => handleOnClickWithdraw(item)}
              />
            </List.Item>
          )}
        </VirtualList>
      </List>
      <DepositModal tokenPair={depositPair} onDismissModal={() => setDepositPair(undefined)} />
      <WithdrawModal tokenPair={withdrawPair} onDismissModal={() => setWithdrawPair(undefined)} />
    </>
  );
};

export default PoolList;

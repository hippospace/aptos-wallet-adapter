import { List } from 'antd';
import { IPool } from 'types/pool';
import VirtualList from 'rc-virtual-list';
import PoolCard from './PoolCard';
import { useSelector } from 'react-redux';
import { getLayoutHeight } from 'modules/common/reducer';

interface TProps {
  filteredPools: IPool[];
}

const PoolList: React.FC<TProps> = ({ filteredPools }) => {
  const containerHeight = useSelector(getLayoutHeight);
  console.log('MEMEMEM>', containerHeight);
  return (
    <List className="h-full overflow-y-scroll border-0">
      <VirtualList
        data={filteredPools}
        height={containerHeight - 100}
        itemHeight={130}
        itemKey="tokenList">
        {(item) => (
          <List.Item className="!border-b-0 !px-0" key={item.id}>
            <PoolCard pool={item} />
          </List.Item>
        )}
      </VirtualList>
    </List>
  );
};

export default PoolList;

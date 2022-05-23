import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import poolAction from 'modules/pool/actions';
import { useSelector } from 'react-redux';
import { getFilteredPoolList } from 'modules/pool/reducer';
import useFetchToken from 'hooks/useFetchToken';
import PoolList from './components/PoolList';
import SummaryPanel from './components/SummaryPanel';
import FilterPanel from './components/FilterPanel';

const Pool: React.FC = () => {
  const dispatch = useDispatch();
  const poolsToRender = useSelector(getFilteredPoolList);
  useFetchToken();

  const fetchTokenList = useCallback(async () => {
    const resp = await fetch('/mock/pools.json');
    const data = await resp.json();
    dispatch(poolAction.SET_POOL_LIST(data.pools));
  }, [dispatch]);

  useEffect(() => {
    dispatch(poolAction.SET_IS_FETCHING);
    // TO DO: implement real fetch
    fetchTokenList();
  }, []);

  return (
    <div className="w-full flex h-full gap-14">
      <div className="w-[267px]">
        <SummaryPanel />
        <hr className="border-[1px] border-primeBlack20 my-10" />
        <FilterPanel />
      </div>
      <div className="block w-full">
        <PoolList filteredPools={poolsToRender} />
      </div>
    </div>
  );
};

export default Pool;

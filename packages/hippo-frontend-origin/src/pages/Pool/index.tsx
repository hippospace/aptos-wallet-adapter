import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import poolAction from 'modules/pool/actions';
import { useSelector } from 'react-redux';
import { getFilteredPoolList } from 'modules/pool/reducer';
import useFetchToken from 'hooks/useFetchToken';
import PoolList from './components/PoolList';
import SummaryPanel from './components/SummaryPanel';
import FilterPanel from './components/FilterPanel';
import useHippoClient from 'hooks/useHippoClient';
import { StructTag } from '@manahippo/aptos-tsgen';
import { getJointName } from 'utils/hippoWalletUtil';

const Pool: React.FC = () => {
  const dispatch = useDispatch();
  const poolsToRender = useSelector(getFilteredPoolList);
  useFetchToken();
  const { hippoSwap } = useHippoClient();

  const fetchTokenList = useCallback(async () => {
    const resp = await fetch('/mock/pools.json');
    const data = await resp.json();
    if (hippoSwap?.cpMetas) {
      for (const cpMeta of hippoSwap.cpMetas) {
        if (!(cpMeta.typeTag instanceof StructTag)) {
          throw new Error('Unexpected cpMeta type');
        }
        if (cpMeta.typeTag.typeParams.length !== 2) {
          throw new Error(
            `Unexpected cpMeta typeparameter length: ${cpMeta.typeTag.typeParams.length}`
          );
        }
        const [xTag, yTag] = cpMeta.typeTag.typeParams;
        const jointName = getJointName(xTag, yTag);
        console.log('Pool joint name>>>', jointName);
      }
    }
    dispatch(poolAction.SET_POOL_LIST(data.pools));
  }, [dispatch, hippoSwap]);

  useEffect(() => {
    dispatch(poolAction.SET_IS_FETCHING);
    // TO DO: implement real fetch
    fetchTokenList();
  }, [hippoSwap]);

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

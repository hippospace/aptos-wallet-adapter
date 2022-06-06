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
import { getTypeTagFullname, StructTag } from '@manahippo/aptos-tsgen';
import { IPool } from 'types/pool';

const Pool: React.FC = () => {
  const dispatch = useDispatch();
  const poolsToRender = useSelector(getFilteredPoolList);
  useFetchToken();
  const { hippoSwap } = useHippoClient();

  const fetchTokenList = useCallback(async () => {
    let data = { pools: [] as IPool[] };
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
        const [xFullname, yFullname] = [xTag, yTag].map(getTypeTagFullname);
        const xTokenInfo = hippoSwap.tokenFullnameToTokenInfo[xFullname];
        const yTokenInfo = hippoSwap.tokenFullnameToTokenInfo[yFullname];
        // FIXME: these methods of computing TVL only work for constant product pools whose one side is a USD stablecoin
        const stableCoinTvl =
          cpMeta.balance_y.value.toJSNumber() / Math.pow(10, xTokenInfo.decimals);
        data.pools.push({
          id: '',
          feeTier: '',
          liquidity: '',
          sqrtPrice: '',
          tick: '',
          token0: {
            id: '',
            symbol: xTokenInfo.symbol,
            name: xTokenInfo.name,
            decimals: xTokenInfo.decimals.toString(),
            derivedETH: ''
          },
          token1: {
            id: '',
            symbol: yTokenInfo.symbol,
            name: yTokenInfo.name,
            decimals: yTokenInfo.decimals.toString(),
            derivedETH: ''
          },
          token0Price: '',
          token1Price: '',
          volumeUSD: '',
          txCount: '',
          totalValueLockedToken0: stableCoinTvl.toFixed(2),
          totalValueLockedToken1: stableCoinTvl.toFixed(2),
          totalValueLockedUSD: (stableCoinTvl * 2).toFixed(2)
        });
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

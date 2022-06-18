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
import { IPool } from 'types/pool';
import { HippoConstantProductPool, HippoPieceSwapPool } from '@manahippo/hippo-sdk';

const Pool: React.FC = () => {
  const dispatch = useDispatch();
  const poolsToRender = useSelector(getFilteredPoolList);
  useFetchToken();
  const { hippoSwap } = useHippoClient();

  const fetchTokenList = useCallback(async () => {
    let data = { pools: [] as IPool[] };
    if (hippoSwap?.cpMetas) {
      for (const pool of hippoSwap.allPools()) {
        const xTokenInfo = pool.xTokenInfo;
        const yTokenInfo = pool.yTokenInfo;
        // FIXME: these methods of computing TVL only work for constant product pools whose one side is a USD stablecoin
        let totalTvlInUSD;
        if (pool instanceof HippoConstantProductPool) {
          totalTvlInUSD =
            (pool.cpPoolMeta.balance_y.value.toJSNumber() / Math.pow(10, xTokenInfo.decimals)) * 2;
        } else if (pool instanceof HippoPieceSwapPool) {
          // if one of them is USDC, USDT, DAI, just add them up
          const stables = ['USDC', 'USDT', 'DAI'];
          if (
            stables.includes(pool.xTokenInfo.symbol) ||
            stables.includes(pool.yTokenInfo.symbol)
          ) {
            totalTvlInUSD = pool.xUiBalance() + pool.yUiBalance();
          } else {
            totalTvlInUSD = 0;
          }
        } else {
          totalTvlInUSD = 0;
        }
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
          poolType: pool.getPoolType(),
          token0Price: '',
          token1Price: '',
          volumeUSD: '',
          txCount: '',
          totalValueLockedToken0: totalTvlInUSD.toFixed(2),
          totalValueLockedToken1: totalTvlInUSD.toFixed(2),
          totalValueLockedUSD: totalTvlInUSD.toFixed(2)
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

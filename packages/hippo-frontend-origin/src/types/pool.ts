export interface IPoolToken {
  id: string;
  symbol: string;
  name: string;
  decimals: string;
  derivedETH: string;
}

export interface IPool {
  id: string;
  feeTier: string;
  liquidity: string;
  sqrtPrice: string;
  tick: string;
  token0: IPoolToken;
  token1: IPoolToken;
  token0Price: string;
  token1Price: string;
  volumeUSD: string;
  txCount: string;
  totalValueLockedToken0: string;
  totalValueLockedToken1: string;
  totalValueLockedUSD: string;
}

export interface IPoolFilters {
  search: string;
  filterBy: string;
  sortBy: string;
  showSelfLiquidity: boolean;
}

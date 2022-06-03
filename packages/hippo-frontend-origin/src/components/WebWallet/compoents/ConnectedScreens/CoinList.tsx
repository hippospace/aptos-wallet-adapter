import CoinIcon from 'components/CoinIcon';
import useHippoClient from 'hooks/useHippoClient';
import { useMemo } from 'react';

const CoinList: React.FC = () => {
  const { tokenStores, tokenInfos } = useHippoClient();

  const renderTokenList = useMemo(() => {
    if (tokenStores && tokenInfos) {
      return Object.keys(tokenStores).map((symbol) => {
        const store = tokenStores[symbol];
        const tokenInfo = tokenInfos[symbol];
        return (
          <div
            className="border-2 border-grey-900 py-2 px-6 flex bg-primePurple-100 justify-between"
            key={symbol}>
            <div className="flex gap-3 justify-center items-center">
              <CoinIcon logoSrc={tokenInfo.logo_url} />
              <h5 className="font-bold text-grey-900">{tokenInfo.symbol}</h5>
            </div>
            <h5 className="font-bold text-grey-900">
              {store.coin.value.toJSNumber() / Math.pow(10, tokenInfo.decimals)}
            </h5>
          </div>
        );
      });
    }
  }, [tokenInfos, tokenStores]);

  return (
    <div className="">
      <div className="flex flex-col gap-4">{renderTokenList}</div>
    </div>
  );
};

export default CoinList;

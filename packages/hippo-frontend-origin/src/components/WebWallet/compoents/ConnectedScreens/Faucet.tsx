import Button from 'components/Button';
import CoinIcon from 'components/CoinIcon';
import useHippoClient from 'hooks/useHippoClient';
import { useMemo } from 'react';

const Faucet: React.FC = () => {
  const { tokenStores, tokenInfos, requestFaucet } = useHippoClient();

  const onRequestFaucet = async (coin: string) => {
    await requestFaucet(coin, '10');
  };

  const renderTokenList = useMemo(() => {
    if (tokenStores && tokenInfos) {
      return Object.keys(tokenStores).map((symbol) => {
        const store = tokenStores[symbol];
        const tokenInfo = tokenInfos[symbol];
        return (
          <div
            className="border-2 h-14 border-grey-900 py-2 px-6 flex bg-primePurple-100 justify-between items-center"
            key={symbol}>
            <div className="flex gap-3 justify-center items-center">
              <CoinIcon logoSrc={tokenInfo.logo_url} />
              <div className="font-bold text-grey-900">{tokenInfo.symbol}</div>
            </div>
            <div className="flex gap-4 justify-center items-center">
              <small className="text-grey-700 uppercase">
                {store.coin.value.toJSNumber() / Math.pow(10, tokenInfo.decimals)} {symbol}
              </small>
              <Button className="font-bold p-0 px-2" onClick={() => onRequestFaucet(symbol)}>
                Faucet
              </Button>
            </div>
          </div>
        );
      });
    }
  }, [tokenInfos, tokenStores, requestFaucet]);

  return (
    <div className="">
      <div className="flex flex-col gap-4">{renderTokenList}</div>
    </div>
  );
};

export default Faucet;

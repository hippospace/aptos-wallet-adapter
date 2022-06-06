import Button from 'components/Button';
import CoinIcon from 'components/CoinIcon';
import useHippoClient from 'hooks/useHippoClient';
import { useCallback, useMemo, useState } from 'react';

const Faucet: React.FC = () => {
  const [loading, setLoading] = useState('');
  const { tokenStores, tokenInfos, requestFaucet } = useHippoClient();

  const onRequestFaucet = useCallback(
    async (coin: string) => {
      setLoading(coin);
      await requestFaucet(coin, '10');
      setLoading('');
    },
    [requestFaucet]
  );

  const renderTokenList = useMemo(() => {
    if (tokenStores && tokenInfos) {
      return Object.keys(tokenInfos)
        .filter((symbol) => {
          return (
            tokenInfos[symbol].token_type.module_name.toString().startsWith('MockCoin') ||
            symbol === 'APTOS'
          );
        })
        .map((symbol) => {
          const store = tokenStores[symbol];
          const tokenInfo = tokenInfos[symbol];
          return (
            <div
              className="border-2 h-14 border-grey-900 py-2 px-6 flex bg-primePurple-100 justify-between items-center"
              key={symbol}>
              <div className="flex gap-3 justify-center items-center">
                <CoinIcon logoSrc={tokenInfo.logo_url} />
                <div className="font-bold text-grey-900">{tokenInfo.name}</div>
              </div>
              <div className="flex gap-4 justify-center items-center">
                <small className="text-grey-700 font-bold uppercase">
                  {`${store ? store.coin.value.toJSNumber() / Math.pow(10, tokenInfo.decimals) : 0} 
                  ${symbol}`}{' '}
                </small>
                <Button
                  isLoading={loading === symbol}
                  className="font-bold p-0 px-2"
                  onClick={() => onRequestFaucet(symbol)}>
                  Faucet
                </Button>
              </div>
            </div>
          );
        });
    }
  }, [tokenInfos, tokenStores, loading, onRequestFaucet]);

  return (
    <div className="">
      <div className="flex flex-col gap-4">{renderTokenList}</div>
    </div>
  );
};

export default Faucet;

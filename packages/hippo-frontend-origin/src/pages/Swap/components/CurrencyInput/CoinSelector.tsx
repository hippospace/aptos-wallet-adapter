import { Input, List } from 'components/Antd';
import { useFormikContext } from 'formik';
import { getTokenList } from 'modules/swap/reducer';
import { ISwapSettings } from 'pages/Swap/types';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ITokenInfo } from 'types/tokenList';
import VirtualList from 'rc-virtual-list';
import CoinRow from './CoinRow';

import CommonCoinButton from './CommonCoinButton';

interface TProps {
  actionType: 'currencyTo' | 'currencyFrom';
  // isVisible: boolean;
  dismissiModal: () => void;
}

const commonCoins = [
  {
    chainId: 1,
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389'
  },
  {
    chainId: 1,
    name: 'Solana',
    address: '0xD31a59c85aE9D8edEFeC411D448f90841571b89c',
    decimals: 9,
    symbol: 'SOL',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/16116.png'
  }
];

const CoinSelector: React.FC<TProps> = ({ dismissiModal, actionType }) => {
  const { values, setFieldValue } = useFormikContext<ISwapSettings>();
  const tokenList = useSelector(getTokenList);
  const [filter, setFilter] = useState<string>('');

  const onSelectToken = useCallback(
    (token: ITokenInfo) => {
      setFieldValue(actionType, {
        ...values[actionType],
        token
      });
      dismissiModal();
    },
    [actionType, values, setFieldValue, dismissiModal]
  );

  const filteredTokenList = useMemo(() => {
    if (!filter) return tokenList;
    return tokenList.filter((token) => {
      const keysForFilter = [token.name, token.symbol, token.address].join(',').toLowerCase();
      return keysForFilter.includes(filter);
    });
  }, [tokenList, filter]);

  const renderHeaderSearch = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {commonCoins.map((coin) => (
            <CommonCoinButton
              coin={coin}
              key={`common-coin-${coin.symbol}`}
              onClickToken={() => onSelectToken(coin)}
            />
          ))}
        </div>
        <Input
          className="py-4 px-6 font-bold text-base !border-[3px] !border-grey-900 text-grey-900 rounded-xl bg-transparent shadow-transparent"
          value={filter}
          onChange={(e) => setFilter(e.target.value.toLowerCase())}
          placeholder="Search"
        />
      </div>
    );
  }, [filter, onSelectToken]);

  const renderTokenList = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <small className="text-grey-700 font-bold">Token</small>
          <small className="text-grey-700 font-bold">Balance</small>
        </div>
        <List className="h-[376px] overflow-y-scroll border-0">
          <VirtualList data={filteredTokenList} height={376} itemHeight={56} itemKey="tokenList">
            {(item) => (
              <List.Item
                className="!border-b-0 !px-0 cursor-pointer p-1"
                key={`${item.symbol}-${item.address}`}
                onClick={() => onSelectToken(item)}>
                <CoinRow item={item} />
              </List.Item>
            )}
          </VirtualList>
        </List>
      </div>
    );
  }, [filteredTokenList, onSelectToken]);

  return (
    <div className="flex flex-col gap-2">
      {renderHeaderSearch}
      {renderTokenList}
    </div>
  );
};

export default CoinSelector;

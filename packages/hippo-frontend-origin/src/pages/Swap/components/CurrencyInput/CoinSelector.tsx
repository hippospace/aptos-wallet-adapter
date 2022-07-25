import { Input, List } from 'components/Antd';
import { useFormikContext } from 'formik';
import { getTokenList } from 'modules/swap/reducer';
import { ISwapSettings } from 'pages/Swap/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ITokenInfo } from 'types/tokenList';
import VirtualList from 'rc-virtual-list';
import CoinRow from './CoinRow';

import CommonCoinButton from './CommonCoinButton';
import useHippoClient from 'hooks/useHippoClient';

interface TProps {
  actionType: 'currencyTo' | 'currencyFrom';
  // isVisible: boolean;
  dismissiModal: () => void;
}

// interface TokenWithBalance extends ITokenInfo {
//   balance: string;
// }

const CoinSelector: React.FC<TProps> = ({ dismissiModal, actionType }) => {
  const { values, setFieldValue } = useFormikContext<ISwapSettings>();
  const tokenList = useSelector(getTokenList);
  const commonCoins = tokenList.filter((token) => {
    return ['BTC', 'USDT', 'USDC'].includes(token.symbol);
  });
  const [filter, setFilter] = useState<string>('');
  const { hippoWallet } = useHippoClient();
  const [tokenListBalance, setTokenListBalance] = useState<ITokenInfo[]>();

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

  // const filteredTokenList = useMemo(() => {
  //   if (!filter) return tokenList;
  //   return tokenList.filter((token) => {
  //     const keysForFilter = [token.name, token.symbol, token.address].join(',').toLowerCase();
  //     return keysForFilter.includes(filter);
  //   });
  // }, [tokenList, filter]);

  const getFilteredTokenListWithBalance = useCallback(async () => {
    let currentTokenList = tokenList;
    if (filter) {
      currentTokenList = tokenList.filter((token) => {
        const keysForFilter = [token.name, token.symbol, token.address].join(',').toLowerCase();
        return keysForFilter.includes(filter);
      });
    }
    let balance = Number(0).toFixed(4);
    if (hippoWallet) {
      await hippoWallet.refreshStores();
      const results = currentTokenList.map((token) => {
        const store = hippoWallet?.symbolToCoinStore[token?.symbol || ''];
        const ti = hippoWallet?.symbolToTokenInfo[token?.symbol || ''];
        const uiBalance =
          (store?.coin?.value.toJsNumber() || 0) / Math.pow(10, ti?.decimals.toJsNumber() || 1);
        balance = uiBalance.toFixed(4);
        return { ...token, balance } as ITokenInfo & { balance: string };
      });
      setTokenListBalance(results);
    } else {
      setTokenListBalance(currentTokenList);
    }
    return balance;
  }, [hippoWallet, filter, tokenList]);

  useEffect(() => {
    getFilteredTokenListWithBalance();
  }, [getFilteredTokenListWithBalance]);

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
  }, [filter, onSelectToken, commonCoins]);

  const renderTokenList = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <small className="text-grey-700 font-bold">Token</small>
          <small className="text-grey-700 font-bold">{hippoWallet ? 'Balance' : ''}</small>
        </div>
        <List className="h-[376px] overflow-y-scroll no-scrollbar border-0">
          <VirtualList
            data={tokenListBalance || []}
            height={376}
            itemHeight={56}
            itemKey="tokenList">
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
  }, [tokenListBalance, onSelectToken, hippoWallet]);

  return (
    <div className="flex flex-col gap-2">
      {renderHeaderSearch}
      {renderTokenList}
    </div>
  );
};

export default CoinSelector;

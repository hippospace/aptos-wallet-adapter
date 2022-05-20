import { Input, List, Modal } from 'components/Antd';
import { useFormikContext } from 'formik';
import { getTokenList } from 'modules/swap/reducer';
import { ISwapSettings } from 'pages/Swap/types';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CloseIcon } from 'resources/icons';
import { ITokenInfo } from 'types/tokenList';
import VirtualList from 'rc-virtual-list';
import CoinRow from './CoinRow';

import styles from './CoinSelector.module.scss';
import CommonCoinButton from './CommonCoinButton';

interface TProps {
  actionType: 'currencyTo' | 'currencyFrom';
  isVisible: boolean;
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

const CoinSelector: React.FC<TProps> = ({ isVisible, dismissiModal, actionType }) => {
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
      <div className="px-[30px] flex flex-col gap-6">
        <div className="header5 bold">Select a token</div>
        <Input
          className="py-4 px-2 header5 text-primeBlack80 rounded-[10px] bg-primeBlack border-primeBlack80 hover:!border-primeBlack80 focus:!border-primeBlack80"
          value={filter}
          onChange={(e) => setFilter(e.target.value.toLowerCase())}
          placeholder="Search name or paste address"
        />
        <div className="flex gap-2">
          {commonCoins.map((coin) => (
            <CommonCoinButton
              coin={coin}
              key={`common-coin-${coin.symbol}`}
              onClickToken={() => onSelectToken(coin)}
            />
          ))}
        </div>
      </div>
    );
  }, [filter, onSelectToken]);

  const renderTokenList = useMemo(() => {
    return (
      <div className="px-[30px]">
        <div className="flex justify-between mb-3">
          <div className="helpText text-primeBlack80 font-semibold">Token</div>
          <div className="helpText text-primeBlack80 font-semibold">Balance</div>
        </div>
        <List className="h-[376px] overflow-y-scroll border-0">
          <VirtualList data={filteredTokenList} height={376} itemHeight={56} itemKey="tokenList">
            {(item) => (
              <List.Item
                className="!border-b-0 !px-0 cursor-pointer"
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
    <Modal
      onCancel={dismissiModal}
      className=""
      wrapClassName={styles.selectorModal}
      visible={isVisible}
      footer={null}
      closeIcon={<CloseIcon />}>
      {renderHeaderSearch}
      <hr className="w-full my-4 h-[2px] bg-[rgba(45, 45, 45, 0.2)]" />
      {renderTokenList}
      <hr className="w-full my-4 h-[2px] bg-[rgba(45, 45, 45, 0.2)]" />
      <div className="w-full text-center title bold text-primary cursor-pointer">
        Manage Token Lists
      </div>
    </Modal>
  );
};

export default CoinSelector;

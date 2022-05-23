import { getTokenList } from 'modules/swap/reducer';
import { useSelector } from 'react-redux';
import { IPoolToken } from 'types/pool';

const useToken = () => {
  const tokenList = useSelector(getTokenList);

  const retreiveTokenImg = (tokens: IPoolToken[]) => {
    return tokens.map((token) => {
      const existToken = tokenList.find((t) => t.symbol === token.symbol);
      return existToken?.logoURI;
    });
  };

  return { retreiveTokenImg };
};

export default useToken;

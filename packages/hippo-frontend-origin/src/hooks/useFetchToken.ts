import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import swapAction from 'modules/swap/actions';
import useHippoClient from './useHippoClient';

const useFetchToken = () => {
  const dispatch = useDispatch();
  const hippoClient = useHippoClient();

  const fetchTokenList = useCallback(async () => {
    //const resp = await fetch('/mock/tokenList.json');
    //const data = await resp.json();
    let data = [];
    if (hippoClient.hippoSwap) {
      for (const tokenInfo of hippoClient.hippoSwap.singleTokens) {
        data.push({
          address: '',
          chainId: 0,
          decimals: tokenInfo.decimals.toJsNumber(),
          name: tokenInfo.name.str(),
          symbol: tokenInfo.symbol.str(),
          logoURI: tokenInfo.logo_url.str()
        });
      }
    }
    dispatch(swapAction.SET_TOKEN_LIST(data));
  }, [dispatch, hippoClient]);

  useEffect(() => {
    dispatch(swapAction.SET_IS_FETCHING);
    // TO DO: implement real fetch
    fetchTokenList();
  }, [hippoClient]);
};

export default useFetchToken;

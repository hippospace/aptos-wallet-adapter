import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import swapAction from 'modules/swap/actions';

const useFetchToken = () => {
  const dispatch = useDispatch();

  const fetchTokenList = useCallback(async () => {
    const resp = await fetch('/mock/tokenList.json');
    const data = await resp.json();
    dispatch(swapAction.SET_TOKEN_LIST(data));
  }, [dispatch]);

  useEffect(() => {
    dispatch(swapAction.SET_IS_FETCHING);
    // TO DO: implement real fetch
    fetchTokenList();
  }, []);
};

export default useFetchToken;

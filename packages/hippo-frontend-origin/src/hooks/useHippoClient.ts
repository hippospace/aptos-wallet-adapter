import { useContext } from 'react';
import { HippoClientContext } from 'contexts/HippoClientProvider';

const useHippoClient = () => useContext(HippoClientContext);

export default useHippoClient;

import { useContext } from 'react';
import { AptosWalletContext } from 'contexts/AptosWalletProvider';

const useAptosWallet = () => useContext(AptosWalletContext);

export default useAptosWallet;

import Button from 'components/Button';
import useAptosWallet from 'hooks/useAptosWallet';
import { walletAddressEllipsis } from 'utils/utility';
import { CaretIcon } from 'resources/icons';
import { Popover } from 'components/Antd';
import styles from './WalletConnector.module.scss';
// import WebWallet from 'components/WebWallet';
import WalletSelector from './components/WalletSelector';
import WalletMenu from './components/WalletMenu';
// import { useCallback } from 'react';

const WalletConnector: React.FC = () => {
  const { activeWallet, openModal, open, closeModal } = useAptosWallet();

  // const renderActiveWallet = useCallback(() => {
  //   return (
  //     <div className='flex gap-2'>
  //       <img src={}
  //     </div>
  //   )
  // }, [])

  return (
    <>
      <Popover
        overlayClassName={styles.popover}
        trigger="click"
        visible={open}
        onVisibleChange={(visible) => (visible ? openModal() : closeModal())}
        content={activeWallet ? <WalletMenu /> : <WalletSelector />}
        destroyTooltipOnHide
        placement="bottomLeft">
        <div className="flex gap-4 items-center">
          <Button
            className="min-w-[156px] h-10 rounded-xl !shadow-sm !text-grey-900 !bg-primePurple-100 font-bold"
            // onClick={!address ? toggleConnectModal : undefined}
          >
            {activeWallet
              ? walletAddressEllipsis(activeWallet.toString() || '')
              : 'Connect To Wallet'}
          </Button>
          <CaretIcon className="fill-black" />
        </div>
      </Popover>
    </>
  );
};

export default WalletConnector;

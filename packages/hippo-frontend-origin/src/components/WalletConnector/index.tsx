import Button from 'components/Button';
import useAptosWallet from 'hooks/useAptosWallet';
import { walletAddressEllipsis } from 'utils/utility';
import { CaretIcon } from 'resources/icons';
import { Popover } from 'components/Antd';
import styles from './WalletConnector.module.scss';
// import WebWallet from 'components/WebWallet';
import WalletSelector from './components/WalletSelector';
import WalletMenu from './components/WalletMenu';
import { useWallet } from '@manahippo/aptos-wallet-adapter';
import { useCallback } from 'react';
import WebWallet from 'components/WebWallet';
// import { useCallback } from 'react';

const WalletConnector: React.FC = () => {
  const { activeWallet, openModal, open, closeModal } = useAptosWallet();
  const { wallet } = useWallet();

  const renderContent = useCallback(() => {
    if (wallet && wallet.adapter.name === 'Hippo Wallet') {
      return <WebWallet />;
    }
    return activeWallet ? <WalletMenu /> : <WalletSelector />;
  }, [activeWallet, wallet]);

  return (
    <>
      <Popover
        overlayClassName={styles.popover}
        trigger="click"
        visible={open}
        onVisibleChange={(visible) => (visible ? openModal() : closeModal())}
        content={renderContent}
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

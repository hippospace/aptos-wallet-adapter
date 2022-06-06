import { AptosAccountObject } from 'aptos';
import { Menu, MenuProps } from 'components/Antd';
import useAptosWallet from 'hooks/useAptosWallet';
import { useCallback, useMemo } from 'react';
import { CheckIcon, PlusSMIcon } from 'resources/icons';
import { walletAddressEllipsis } from 'utils/utility';
import styles from './WalletList.module.scss';
interface TProps {
  onSelect: () => void;
  onAddNew: () => void;
}

const WalletList: React.FC<TProps> = ({ onSelect, onAddNew }) => {
  const { walletList, setActiveAptosWallet, activeWallet } = useAptosWallet();
  const privateKeyObject = activeWallet?.aptosAccount?.toPrivateKeyObject();

  const optionLabel = useCallback(
    (walletName: string, aptosAccountObj: AptosAccountObject) => {
      return (
        <div className="flex justify-between">
          <div className="title w-[88px] truncate font-bold text-grey-900">{walletName}</div>
          <div className="title font-bold text-grey-500">
            ({walletAddressEllipsis(aptosAccountObj.address || '')})
          </div>
          <span>
            {aptosAccountObj?.privateKeyHex === privateKeyObject?.privateKeyHex ? (
              <CheckIcon />
            ) : (
              <div className="w-6 block" />
            )}
          </span>
        </div>
      );
    },
    [privateKeyObject]
  );

  const items: MenuProps['items'] = useMemo(() => {
    const walletOptions = walletList.map(({ walletName, aptosAccountObj }) => ({
      label: optionLabel(walletName, aptosAccountObj),
      key: aptosAccountObj.privateKeyHex,
      onClick: () => {
        setActiveAptosWallet(walletName);
        onSelect();
      }
    }));
    return [
      ...walletOptions,
      {
        label: (
          <div className="flex justify-between items-center">
            <div className="title font-bold text-grey-900">Add/Connect wallet</div>
            <PlusSMIcon />
          </div>
        ),
        key: 'addNewWallet',
        onClick: () => {
          onAddNew();
        }
      }
    ];
  }, [optionLabel, setActiveAptosWallet, walletList, onSelect, onAddNew]);

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    //  setCurrent(e.key);
  };

  return (
    <div className="flex flex-col gap-4">
      <Menu
        onClick={onClick}
        theme="dark"
        className={styles.menu}
        mode="inline"
        items={items}
        selectedKeys={[privateKeyObject?.privateKeyHex || '']}
      />
    </div>
  );
};

export default WalletList;

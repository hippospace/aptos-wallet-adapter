import useAptosWallet from 'hooks/useAptosWallet';
import { useMemo, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CloseIcon, CopyIcon, SwapIcon } from 'resources/icons';

interface TProps {
  onShowWalletList: () => void;
}

const WalletOverview: React.FC<TProps> = ({ onShowWalletList }) => {
  const { activeWallet } = useAptosWallet();
  const privateKeyObject = activeWallet?.aptosAccount?.toPrivateKeyObject();
  const credentials = useMemo(
    () => [
      {
        key: 'address',
        label: 'Address',
        text: privateKeyObject?.address || ''
      }
    ],
    [privateKeyObject]
  );
  const [copied, setCopied] = useState(credentials.map((c) => ({ [c.key]: false })));

  const handleOnClickCopy = (key: string) => {
    setCopied((prevState) => ({
      ...prevState,
      [key]: true
    }));
    setTimeout(
      () =>
        setCopied((prevState) => ({
          ...prevState,
          [key]: false
        })),
      2000
    );
  };

  return (
    <div className="flex py-4 px-6 border-b-2 border-grey-900 items-center justify-between">
      <SwapIcon className="rotate-90 cursor-pointer" onClick={onShowWalletList} />
      <div className="flex flex-col gap-4 items-center">
        <div className="flex gap-2 items-center">
          <h3 className="text-primary font-bold">{activeWallet?.walletName}</h3>
        </div>
        {credentials.map(({ text, key }) => (
          <div className="flex gap-2 justify-between" key={key}>
            <CopyToClipboard text={text} onCopy={() => handleOnClickCopy(key)}>
              {copied[key as any] ? (
                <small className="text-green-500">Copied!</small>
              ) : (
                <div className="title text-grey-700 cursor-pointer flex gap-2">
                  <div>({text.slice(0, 4) + '....' + text.slice(-6)})</div>
                  <CopyIcon />
                </div>
              )}
            </CopyToClipboard>
          </div>
        ))}
      </div>
      <CloseIcon />
    </div>
  );
};

export default WalletOverview;

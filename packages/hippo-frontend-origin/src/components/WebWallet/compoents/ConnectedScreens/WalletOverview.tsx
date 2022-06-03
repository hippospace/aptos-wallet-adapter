import useAptosWallet from 'hooks/useAptosWallet';
import { useMemo, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const WalletOverview: React.FC = () => {
  const { activeWallet } = useAptosWallet();
  const privateKeyObject = activeWallet?.aptosAccount?.toPrivateKeyObject();
  const credentials = useMemo(
    () => [
      {
        key: 'address',
        label: 'Address',
        text: privateKeyObject?.address || ''
      },
      {
        key: 'privateKey',
        label: 'Private Key',
        text: privateKeyObject?.privateKeyHex || ''
      },
      {
        key: 'publicKey',
        label: 'Public Key',
        text: privateKeyObject?.publicKeyHex || ''
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
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <div className="text-grey-900 font-bold">Current Wallet:</div>
        <h5 className="text-grey-900 font-bold">{activeWallet?.walletName}</h5>
      </div>
      {credentials.map(({ text, key, label }) => (
        <div className="flex gap-2 justify-between" key={key}>
          <small className="text-grey-900 font-bold">{label}:</small>
          <CopyToClipboard text={text} onCopy={() => handleOnClickCopy(key)}>
            {copied[key as any] ? (
              <small className="text-green-500">Copied!</small>
            ) : (
              <small className="text-grey-500 break-words cursor-pointer">
                {text.slice(0, 16) + '....'}
              </small>
            )}
          </CopyToClipboard>
        </div>
      ))}
    </div>
  );
};

export default WalletOverview;

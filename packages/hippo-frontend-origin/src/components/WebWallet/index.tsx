import { WEBWALLET_URL } from 'config/aptosConstants';

const WebWallet: React.FC = () => {
  return (
    <iframe
      loading="lazy"
      id="receiver"
      className="rounded-[11px]"
      src={WEBWALLET_URL}
      width="464"
      height="700"
    />
  );
};

export default WebWallet;

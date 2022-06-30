import { WEBWALLET_URL } from 'config/aptosConstants';

const WebWallet: React.FC = () => {
  return (
    <iframe
      loading="lazy"
      id="receiver"
      className="rounded-[11px]"
      src={WEBWALLET_URL}
      width="376"
      height="629"
    />
  );
};

export default WebWallet;

import Button from 'components/Button';
import { useNavigate } from 'react-router-dom';

const WebWallet: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col gap-4 justify-center items-center">
      <h4>New to Hippo Wallet?</h4>
      <div className="flex gap-4">
        <div className="border-2 border-grey-500 rounded-lg flex flex-col items-center gap-4 p-4">
          <h5>No, I already have a Secret Recovery Phrase</h5>
          <Button>Import wallet</Button>
        </div>
        <div className="border-2 border-grey-500 rounded-lg flex flex-col items-center gap-4 p-4">
          <h5>Yes, let’s create a new wallet</h5>
          <small>
            If you do not have a wallet account, you can create a private / public key account by
            clicking the button below
          </small>
          <Button onClick={() => navigate('create')}>Create a wallet</Button>
        </div>
      </div>
    </div>
  );
};

export default WebWallet;

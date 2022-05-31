import Button from 'components/Button';
import { useNavigate } from 'react-router-dom';

const CreateWallet: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="">
      <h5>New Account</h5>
      <small>
        If you do not have a wallet account, you can create or import a private / public key account
        by clicking the button below
      </small>
      <Button onClick={() => navigate('/wallet')}>Create Account</Button>
    </div>
  );
};

export default CreateWallet;

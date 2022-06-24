import { BrowserRouter } from 'react-router-dom';
import { PageLayout } from 'components';
import Routes from 'App.routes';
// import TransactionModal from 'components/TransactionModal';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PageLayout>
        <Routes />
        {/* <TransactionModal /> */}
      </PageLayout>
    </BrowserRouter>
  );
};

export default App;

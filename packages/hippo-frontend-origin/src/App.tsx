import { BrowserRouter } from 'react-router-dom';
import { PageLayout } from 'components';
import Routes from 'App.routes';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PageLayout>
        <Routes />
      </PageLayout>
    </BrowserRouter>
  );
};

export default App;

import { Antd } from 'components';
import { Footer, Header } from './components';
// import styles from './PageLayout.module.scss';

const { Content } = Antd.Layout;

const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Antd.Layout className="relative min-h-screen bg-primary">
      <Header />
      <Content className="">{children}</Content>
      <Footer />
    </Antd.Layout>
  );
};

export default PageLayout;

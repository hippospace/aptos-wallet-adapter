import { Antd } from 'components';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import commonAction from 'modules/common/actions';
import { Footer, Header } from './components';
import { getLayoutHeight } from 'modules/common/reducer';
import { useSelector } from 'react-redux';
// import styles from './PageLayout.module.scss';

const { Content } = Antd.Layout;

const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLElement>(null);
  const dispatch = useDispatch();
  const contentHeight = useSelector(getLayoutHeight);

  useEffect(() => {
    if (containerRef?.current && containerRef?.current?.clientHeight && !contentHeight)
      dispatch(commonAction.SET_LAYOUT_HEIGHT(containerRef?.current?.clientHeight));
  }, [containerRef, contentHeight, dispatch]);

  return (
    <Antd.Layout className="relative min-h-screen bg-primary">
      <Header />
      <Content className="mt-32 px-16 py-16" ref={containerRef}>
        {children}
      </Content>
      <Footer />
    </Antd.Layout>
  );
};

export default PageLayout;

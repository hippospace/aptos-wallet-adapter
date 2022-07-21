import { Antd } from 'components';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import commonAction from 'modules/common/actions';
import { Footer, Header } from './components';
import { getLayoutHeight } from 'modules/common/reducer';
import { useSelector } from 'react-redux';
import HippoLogoBg from 'resources/img/hippo-logo-bg.png';
import useCurrentPage from 'hooks/useCurrentPage';
import classNames from 'classnames';
// import styles from './PageLayout.module.scss';

const { Content } = Antd.Layout;

const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const contentHeight = useSelector(getLayoutHeight);

  useEffect(() => {
    if (containerRef?.current && containerRef?.current?.clientHeight && !contentHeight)
      dispatch(commonAction.SET_LAYOUT_HEIGHT(containerRef?.current?.clientHeight));
  }, [containerRef, contentHeight, dispatch]);

  const [currentPageName] = useCurrentPage();

  return (
    <Antd.Layout
      className={classNames('relative min-h-screen bg-primary overflow-x-hidden', {
        'bg-white': currentPageName === 'Home'
      })}>
      <Header />
      <Content
        className={classNames('pt-[136px] px-16 tablet:px-8 mobile:px-4 mobile:pt-[56px]', {
          'bg-home1': currentPageName === 'Home'
        })}>
        <div
          className={classNames('py-16', {
            'bg-home-icons bg-contain bg-no-repeat bg-top': currentPageName === 'Home'
          })}
          ref={containerRef}>
          <div className="relative z-10">{children}</div>
        </div>
        {currentPageName === 'Home' && (
          <div className="bg-home1 absolute w-full h-full left-0 top-0 rotate-180 -z-0"></div>
        )}
      </Content>
      <Footer />
      <img
        src={HippoLogoBg}
        className="absolute right-0 bottom-0 w-[824.49px] h-auto z-0 laptop:w-[33%] mobile:w-[40%]"
      />
    </Antd.Layout>
  );
};

export default PageLayout;

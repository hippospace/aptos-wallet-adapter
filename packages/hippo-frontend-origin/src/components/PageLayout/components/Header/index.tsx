import { useCallback, useEffect, useState } from 'react';
import { Antd, WalletConnector } from 'components';
import { Link, useLocation } from 'react-router-dom';
import { routes } from 'App.routes';
import { LogoIcon } from 'resources/icons';
import cx from 'classnames';
import styles from './Header.module.scss';

const { Header } = Antd.Layout;

const PageHeader: React.FC = () => {
  const { pathname } = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>('');

  const getNavSelected = useCallback(() => {
    const rootPath = pathname.split('/')[1];
    const pageName = routes?.find((r) => r?.path === rootPath)?.name || routes[0].name;
    if (pageName !== selectedKey) {
      setSelectedKey(pageName);
    }
  }, [pathname, selectedKey, setSelectedKey]);

  const renderNavItems = () => {
    return routes.map(({ name, path, hidden }) => {
      if (path === '*' || hidden) return null;
      // if (path && isDisabledFeature(path))
      //   return (
      //     <Antd.Menu.Item key={name} className={styles.disabledItem}>
      //       {name}
      //     </Antd.Menu.Item>
      //   );

      return (
        <Antd.Menu.Item key={name} className="">
          <Link to={path || '/'} className="header5 bold">
            {name}
          </Link>
        </Antd.Menu.Item>
      );
    });
  };

  useEffect(() => {
    getNavSelected();
  }, [getNavSelected]);

  return (
    <Header className="fixed z-20 w-full px-16 pt-12 bg-transparent h-auto">
      <div className="mx-auto h-[72px] top-0 left-0 flex items-center">
        <div className="grow h-full">
          <Link
            to="/"
            className="w-[72px] h-full bg-secondary flex items-center justify-center rounded-xl">
            <LogoIcon className="w-full h-full" />
          </Link>
        </div>
        <div className="flex grow items-center h-full ml-[180px]">
          <Antd.Menu
            mode="horizontal"
            theme="dark"
            className={cx(styles.menu, 'h-full min-w-[200px]')}
            selectedKeys={[selectedKey]}>
            {renderNavItems()}
          </Antd.Menu>
        </div>
        <WalletConnector />
        <div />
      </div>
    </Header>
  );
};

export default PageHeader;

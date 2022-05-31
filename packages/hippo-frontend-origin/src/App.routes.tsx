import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import Pool from 'pages/Pool';
import Swap from 'pages/Swap';
import WebWallet from 'pages/WebWallet';
import CreateWallet from 'pages/WebWallet/compoents/CreateWallet';

type TRoute = RouteObject & {
  name: string;
  hidden?: boolean; //to hide the visibility in header menu
};

export const routes: TRoute[] = [
  {
    path: 'swap',
    name: 'Swap',
    element: <Swap />
  },
  {
    path: 'pools',
    name: 'Pools',
    element: <Pool />
  },
  {
    path: 'stake',
    name: 'Stake',
    element: <Swap />
  },
  {
    path: 'vote',
    name: 'Vote',
    element: <Swap />
  },
  {
    path: 'launchpad',
    name: 'Launchpad',
    element: <Swap />
  },
  {
    path: 'stats',
    name: 'Stats',
    element: <Swap />
  },
  {
    path: '*',
    name: '404',
    element: <Navigate replace to="/swap" />
  }
];

const walletRoutes: RouteObject[] = [
  {
    path: 'wallet',
    // element: <WebWallet />,
    children: [
      { index: true, element: <WebWallet /> },
      {
        path: 'create',
        element: <CreateWallet />
      },
      {
        path: 'import',
        element: <CreateWallet />
      }
    ]
  }
];

const Routes = () => {
  const activeRoutes = [...routes, ...walletRoutes];

  const elements = useRoutes(activeRoutes as RouteObject[]);
  return elements;
};

export default Routes;

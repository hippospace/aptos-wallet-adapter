import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import Pool from 'pages/Pool';
import Swap from 'pages/Swap';
import Faucet from 'pages/Faucet';
import Home from 'pages/Home';

export type TRoute = RouteObject & {
  name: 'Home' | 'Pools' | 'Swap' | '404' | 'Faucet';
  hidden?: boolean; //to hide the visibility in header menu
};

export const routes: TRoute[] = [
  {
    path: '',
    name: 'Home',
    element: <Home />
  },
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
    path: 'faucet',
    name: 'Faucet',
    element: <Faucet />
  },
  // {
  //   path: 'stake',
  //   name: 'Stake',
  //   element: <Swap />
  // },
  // {
  //   path: 'vote',
  //   name: 'Vote',
  //   element: <Swap />
  // },
  // {
  //   path: 'launchpad',
  //   name: 'Launchpad',
  //   element: <Swap />
  // },
  // {
  //   path: 'stats',
  //   name: 'Stats',
  //   element: <Swap />
  // },
  {
    path: '*',
    name: '404',
    element: <Navigate replace to="/" />
  }
];

const Routes = () => {
  const activeRoutes = [...routes];

  const elements = useRoutes(activeRoutes as RouteObject[]);
  return elements;
};

export default Routes;

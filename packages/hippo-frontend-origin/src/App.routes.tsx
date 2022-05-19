import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import Home from 'pages/Home';

type TRoute = RouteObject & {
  name: string;
  hidden?: boolean; //to hide the visibility in header menu
};

export const routes: TRoute[] = [
  {
    path: 'swap',
    name: 'Swap',
    element: <Home />
  },
  {
    path: 'pools',
    name: 'Pools',
    element: <Home />
  },
  {
    path: 'stake',
    name: 'Stake',
    element: <Home />
  },
  {
    path: 'vote',
    name: 'Vote',
    element: <Home />
  },
  {
    path: 'launchpad',
    name: 'Launchpad',
    element: <Home />
  },
  {
    path: 'stats',
    name: 'Stats',
    element: <Home />
  },
  {
    path: '*',
    name: '404',
    element: <Navigate replace to="/" />
  }
];

const Routes = () => {
  const activeRoutes = routes.filter((route) => route.path);

  const elements = useRoutes(activeRoutes as RouteObject[]);
  return elements;
};

export default Routes;

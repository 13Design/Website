import { useEffect, useState } from 'react';

export type Route =
  | '/'
  | '/services'
  | '/pricing'
  | '/about'
  | '/contact'
  | '/work'
  | '/founding-clients';

const ROUTES: Route[] = [
  '/',
  '/services',
  '/pricing',
  '/about',
  '/contact',
  '/work',
  '/founding-clients',
];

function parseRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return (ROUTES.includes(path as Route) ? path : '/') as Route;
}

export function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(parseRoute);

  useEffect(() => {
    const onPop = () => {
      setRoute(parseRoute());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (r: Route) => {
    if (r === parseRoute()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState({}, '', r);
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  return [route, navigate];
}

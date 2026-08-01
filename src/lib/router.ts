import { useEffect, useState } from 'react';

export type Route =
  | '/'
  | '/services'
  | '/pricing'
  | '/about'
  | '/contact'
  | '/work'
  | '/founding-clients'
  | '/subscribe/success'
  | '/subscribe/cancel'
  | '/terms'
  | '/refunds'
  | '/privacy';

/** Navigate to a route, optionally carrying query params (e.g. the chosen tier). */
export type Navigate = (r: Route, query?: Record<string, string>) => void;

const ROUTES: Route[] = [
  '/',
  '/services',
  '/pricing',
  '/about',
  '/contact',
  '/work',
  '/founding-clients',
  '/subscribe/success',
  '/subscribe/cancel',
  '/terms',
  '/refunds',
  '/privacy',
];

function parseRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return (ROUTES.includes(path as Route) ? path : '/') as Route;
}

function currentHref(): string {
  return `${window.location.pathname.replace(/\/+$/, '') || '/'}${window.location.search}`;
}

export function useRoute(): [Route, Navigate, URLSearchParams] {
  const [route, setRoute] = useState<Route>(parseRoute);
  const [search, setSearch] = useState<string>(() => window.location.search);

  useEffect(() => {
    const onPop = () => {
      setRoute(parseRoute());
      setSearch(window.location.search);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate: Navigate = (r, query) => {
    const qs = query && Object.keys(query).length ? `?${new URLSearchParams(query).toString()}` : '';
    const target = `${r}${qs}`;

    if (target === currentHref()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.history.pushState({}, '', target);
    setRoute(r);
    setSearch(qs);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  return [route, navigate, new URLSearchParams(search)];
}

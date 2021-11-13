import React, { useCallback, useContext, useEffect } from 'react';

const getPathname = (): string => window.location.pathname;

const initPathname = getPathname();

type RouterContextType = {
  pathname: string;
  push: (pathname: string) => void;
};

const RouterContext = React.createContext<RouterContextType>(
  null as unknown as RouterContextType,
);

export const Router: React.FC = (props) => {
  const [pathname, setPathname] = React.useState(initPathname);

  useEffect(() => {
    window.onpopstate = (event): void => {
      setPathname(getPathname());
    };
  });

  const push = useCallback((pathname: string) => {
    window.history.pushState(null, '', pathname);
    setPathname(pathname);
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, push }}>
      {props.children}
    </RouterContext.Provider>
  );
};

type Props = { pathname: string };

export const Route: React.FC<Props> = (props) => {
  const { pathname } = props;
  const context = useRouter();

  useEffect(() => {
    // if (pathname === contextPathname) {
    //   window.history.pushState({}, '', pathname);
    // }
  }, [pathname]);

  if (context.pathname !== pathname) {
    return null;
  }

  return <>{props.children}</>;
};

export function useRouter(): RouterContextType {
  const context = useContext(RouterContext);
  return context;
}

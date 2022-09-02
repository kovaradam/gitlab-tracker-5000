import styled from 'styled-components';
import { Spinner } from '../components/LoadingOverlay';
import { Logo } from '../components/Logo';
import { useLogin } from '../store/use-login';
import { GraphQlQueryProvider } from '../store/use-graphql-query';
import { Login } from './Login';
import { Main } from './Main';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

const loginPath = '/login';

export const App: React.FC<React.PropsWithChildren<unknown>> = () => {
  const login = useLogin();
  const location = useLocation();

  if (login.isLoading) {
    return (
      <S.Wrapper>
        <Logo />
        <S.Spinner />
      </S.Wrapper>
    );
  }

  if (!login.isLoggedIn && location.pathname !== loginPath) {
    return <Navigate to={loginPath} replace />;
  }

  return (
    <Routes>
      <Route
        path="*"
        element={
          <GraphQlQueryProvider>
            <Main />
          </GraphQlQueryProvider>
        }
      />
      <Route
        path={loginPath}
        element={<>{login.isLoggedIn ? <Navigate to="/" /> : <Login />}</>}
      />
    </Routes>
  );
};

const S = {
  Wrapper: styled.main`
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  `,
  Spinner: styled(Spinner)`
    color: var(--main-color);
  `,
};

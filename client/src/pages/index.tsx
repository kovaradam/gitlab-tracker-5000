import styled from 'styled-components';
import { Spinner } from '../components/LoadingOverlay';
import { Logo } from '../components/Logo';
import { useLogin } from '../store/use-login';
import { QueryProvider } from '../store/use-query';
import { Login } from './Login';
import { Main } from './Main';

export const App: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { isLoading, isLoggedIn } = useLogin();

  if (isLoading) {
    return (
      <S.Wrapper>
        <Logo />
        <S.Spinner />
      </S.Wrapper>
    );
  }
  if (!isLoggedIn) {
    return <Login />;
  }
  return (
    <QueryProvider>
      <Main />
    </QueryProvider>
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

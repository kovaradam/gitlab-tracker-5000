import styled from 'styled-components';
import { Spinner } from '../components/LoadingOverlay';
import { Logo } from '../components/Logo';
import { Router } from '../components/Router';
import { useLogin } from '../store/use-login';
import { Login } from './Login';
import { Main } from './Main';

export const App: React.FC = () => {
  const { isLoading, isLoggedIn } = useLogin();

  const Content = isLoggedIn ? Main : Login;
  return (
    <Router>
      {isLoading ? (
        <S.Wrapper>
          <Logo />
          <S.Spinner />
        </S.Wrapper>
      ) : (
        <Content />
      )}
    </Router>
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

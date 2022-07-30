import { useMutation } from '@tanstack/react-query';
import React from 'react';
import styled from 'styled-components';
import { Spinner } from '../components/LoadingOverlay';
import { Logo } from '../components/Logo';
import { createHeaders } from '../config/api';
import {
  gitlabUrlStorage,
  gitlabTokenStorage,
  serviceTokenStorage,
} from '../config/storage';
import { FormStyle } from '../style/form';

const inputs = { gitlabUrl: 'gitlab-url-input', gitlabToken: 'gitlab-token-input' };

export const Login: React.FC<React.PropsWithChildren<unknown>> = () => {
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof typeof inputs, boolean>>
  >({});
  const loginMutation = useMutation((variables: { url: string; token: string }) =>
    fetch(`${variables.url}/api/v4/user`, {
      headers: createHeaders(variables.token),
    }),
  );

  const showErrors = (gitlabUrl: boolean, gitlabToken: boolean): void => {
    setErrors({ gitlabUrl, gitlabToken });
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    const [gitlabUrl, gitlabToken] = ['url', 'token'].map(
      (name) => formData.get(name) as string,
    );

    if (!gitlabUrl || !gitlabToken) {
      showErrors(!gitlabUrl, !gitlabToken);
      return;
    }

    const validUrl = createValidUrl(gitlabUrl);

    try {
      const response = await loginMutation.mutateAsync({
        url: validUrl,
        token: gitlabToken,
      });
      if (!response.ok) {
        throw Error('unauthorized');
      }
      const body = await response.json();

      gitlabUrlStorage.set(validUrl);
      gitlabTokenStorage.set(gitlabToken);
      serviceTokenStorage.set(body.username);
      window.location.href = '';
    } catch (_) {
      showErrors(true, true);
    }
  };

  const registerFieldset = (key: keyof typeof inputs): Record<string, unknown> => {
    return {
      'data-error': errors[key],
      onClick: (): void => setErrors((p) => ({ ...p, [key]: false })),
    };
  };

  return (
    <S.Wrapper>
      <Logo />
      <S.Form onSubmit={onSubmit}>
        <S.Fieldset {...registerFieldset('gitlabUrl')} disabled={loginMutation.isLoading}>
          <S.Label htmlFor={inputs.gitlabUrl}>GitLab url</S.Label>
          <S.Input
            placeholder="gitlab.your-company.com"
            id={inputs.gitlabUrl}
            name="url"
            required
          />
        </S.Fieldset>
        <S.Fieldset
          {...registerFieldset('gitlabToken')}
          disabled={loginMutation.isLoading}
        >
          <S.Label htmlFor={inputs.gitlabToken}>GitLab token</S.Label>
          <S.Input
            placeholder="token"
            id={inputs.gitlabToken}
            name="token"
            required
            type="password"
          />
        </S.Fieldset>
        <S.Submit disabled={loginMutation.isLoading}>
          {loginMutation.isLoading ? <S.Spinner /> : 'Submit'}{' '}
        </S.Submit>
      </S.Form>
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.main`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;
    gap: 1rem;
  `,
  Spinner: styled(Spinner)`
    color: white;
    font-size: 1rem;
  `,
  Form: styled.form`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 2rem;
  `,
  Fieldset: styled(FormStyle.Fieldset)``,
  Label: styled(FormStyle.Label)``,
  Submit: styled(FormStyle.Submit)``,
  Input: styled(FormStyle.Input)``,
};

function createValidUrl(inputUrl: string): string {
  const hasTrailingSlash = inputUrl[inputUrl.length - 1] === '/';
  const urlWithPrefix = inputUrl.includes('http')
    ? inputUrl
    : 'https://'.concat(inputUrl);
  const validUrl = hasTrailingSlash
    ? urlWithPrefix.slice(0, urlWithPrefix.length - 1)
    : urlWithPrefix;
  return validUrl;
}

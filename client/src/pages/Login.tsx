import React from 'react';
import styled from 'styled-components';
import { Spinner } from '../components/LoadingOverlay';
import { Logo } from '../components/Logo';
import { createHeaders } from '../config/api';
import { gitlabUrlStorage, tokenStorage } from '../config/storage';
import { FormStyle } from '../style/form';

const inputs = { gitlabUrl: 'gitlab-url-input', gitlabToken: 'gitlab-token-input' };

export const Login: React.FC = () => {
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof typeof inputs, boolean>>
  >({});
  const [isLoading, setIsLoading] = React.useState(false);

  const inputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  const showErrors = (gitlabUrl: boolean, gitlabToken: boolean): void => {
    setErrors({ gitlabUrl, gitlabToken });
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const [gitlabUrl, gitlabToken] = inputRefs.map(({ current }) => current?.value);

    if (!gitlabUrl || !gitlabToken) {
      showErrors(!gitlabUrl, !gitlabToken);
      return;
    }

    const validUrl = createValidUrl(gitlabUrl);

    setIsLoading(true);

    fetch(`${validUrl}/api/v4/user`, { headers: createHeaders(gitlabToken) })
      .then(({ status }) => {
        if (status !== 200) {
          showErrors(true, true);
          return;
        }
        gitlabUrlStorage.set(validUrl);
        tokenStorage.set(gitlabToken);
        window.location.href = '';
      })
      .catch((_) => {
        showErrors(true, true);
      })
      .finally(() => setIsLoading(false));
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
        <S.Fieldset {...registerFieldset('gitlabUrl')} disabled={isLoading}>
          <S.Label htmlFor={inputs.gitlabUrl}>GitLab url</S.Label>
          <S.Input
            placeholder="gitlab.your-company.com"
            id={inputs.gitlabUrl}
            required
            ref={inputRefs[0]}
          />
        </S.Fieldset>
        <S.Fieldset {...registerFieldset('gitlabToken')} disabled={isLoading}>
          <S.Label htmlFor={inputs.gitlabToken}>GitLab token</S.Label>
          <S.Input
            placeholder="token"
            id={inputs.gitlabToken}
            required
            ref={inputRefs[1]}
            type="password"
          />
        </S.Fieldset>
        <S.Submit>Submit</S.Submit>
        {isLoading && <S.Spinner />}
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
    position: absolute;
    color: var(--main-color);
    top: 100%;
    margin-top: 1rem;
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

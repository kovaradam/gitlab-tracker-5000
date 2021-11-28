import { gql } from 'graphql-request';
import React from 'react';
import styled, { keyframes } from 'styled-components';
import {
  gitlabUrlStorage,
  gitlabTokenStorage,
  serviceTokenStorage,
} from '../config/storage';
import { useQuery } from '../store/use-query';
import { useClickOutsideRef } from '../utils/use-click-outside';
import { useToggle } from '../utils/use-toggle';
import { useRegisterInfoBox } from './InfoBox';
import { Popover } from './PopOver';

const GET_AVATAR_URL = gql`
  query getAvatarUrl {
    currentUser {
      avatarUrl
    }
  }
`;

type Props = { className?: string };

export const UserIcon: React.FC<Props> = (props) => {
  const [isOpen, isOpenToggle] = useToggle();
  const wrapperRef = useClickOutsideRef<HTMLButtonElement>(isOpenToggle.off);

  const [fetchAvatarUrl, { data, isLoading }] =
    useQuery<{ currentUser: { avatarUrl: string } }>(GET_AVATAR_URL);

  React.useEffect(() => {
    fetchAvatarUrl();
  }, [fetchAvatarUrl]);

  const logOut = (): void => {
    [gitlabUrlStorage, gitlabTokenStorage, serviceTokenStorage].forEach((s) =>
      s.delete(),
    );
  };

  const registerInfoBox = useRegisterInfoBox('Open user menu');

  const avatarUrl = gitlabUrlStorage.get()?.concat(data?.currentUser.avatarUrl ?? '');

  return (
    <S.Wrapper {...props} ref={wrapperRef} onClick={isOpenToggle.toggle}>
      {!isLoading && avatarUrl && (
        <S.AvatarImg src={avatarUrl} alt="user avatar" {...registerInfoBox} />
      )}
      <S.DropDownMenu>
        {isOpen && (
          <>
            <S.GitLabLink
              href={gitlabUrlStorage.get() ?? ''}
              rel="noopener noreferrer"
              target="_blank"
            >
              Go to Gitlab
            </S.GitLabLink>
            <S.Line />
            <S.LogOutLink href={''} onClick={logOut}>
              Log out
            </S.LogOutLink>
          </>
        )}
      </S.DropDownMenu>
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.button`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    --background-color: pink;
    background: linear-gradient(
      90deg,
      var(--background-color) -150%,
      white 50%,
      var(--background-color) 250%
    );

    &:active {
      transform: none;
    }

    animation: ${keyframes`
      0%{background-position-x: 0}
      50%{background-position-x: var(--size / 2)}
      100%{background-position-x: var(--size)}
    }`} 500ms linear infinite;
  `,
  AvatarImg: styled.img`
    width: var(--size);
  `,
  DropDownMenu: styled(Popover)`
    right: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: baseline;
    font-size: 1.2rem;
    padding: 1rem;
    gap: 1rem;
    z-index: 10;
    transition: none;
  `,
  GitLabLink: styled.a`
    white-space: nowrap;
  `,
  LogOutLink: styled.a`
    white-space: nowrap;
    text-decoration: none;
    color: grey;
  `,
  Line: styled.hr`
    border: 1px dashed grey;
    width: 100%;
    margin: 0;
  `,
};

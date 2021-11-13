import React from 'react';
import styled from 'styled-components';
import { FormStyle } from '../../style/form';
import { Spinner } from '../LoadingOverlay';

type Props = {
  children: ((inputValue: string) => React.ReactNode) | React.ReactNode;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  id?: string;
};

export const SearchInput = React.forwardRef<HTMLInputElement, Props>(
  ({ isLoading, className, children, ...inputProps }, forwardedRef) => {
    const [value, setValue] = React.useState('');

    return (
      <S.Wrapper className={className}>
        <S.Input
          onChange={({ target: { value } }): void => setValue(value)}
          ref={forwardedRef}
          {...inputProps}
        />
        {isLoading && <S.Spinner />}
        <S.ResultsWrapper>
          {typeof children === 'function' ? children(value) : children}
        </S.ResultsWrapper>
      </S.Wrapper>
    );
  },
);

const S = {
  Wrapper: styled.div`
    position: relative;
    display: flex;
    align-items: center;
    transition: all 100ms;

    &:not(:focus-within) {
      & > ul {
        display: none;
      }
    }

    &:focus-within {
      transform: scale(1.05);
      z-index: 1;
    }
  `,
  Input: styled(FormStyle.Input)`
    &:focus {
      transform: none;
    }
  `,
  ResultsWrapper: styled.ul`
    position: absolute;
    top: 100%;
    width: 100%;
    box-shadow: var(--base-shadow);
    padding: 0.5rem;
    margin: 0;
    box-sizing: border-box;
    list-style-type: none;
    background-color: white;
    z-index: 1;
    display: block;

    &:empty {
      display: none;
    }
  `,
  SearchResult: styled.li`
    padding: 0.5rem 0;
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:not(:last-child) {
      border-bottom: 1px dashed var(--grey);
    }
  `,
  Spinner: styled(Spinner)`
    color: var(--grey);
    position: absolute;
    right: 0.8rem;
    font-size: 1.2rem;
  `,
};

export const SearchResult = S.SearchResult;

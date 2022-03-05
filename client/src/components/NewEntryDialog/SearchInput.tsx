import React from 'react';
import styled from 'styled-components';
import { handleRefs } from 'utils/handle-refs';
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
    const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const resultsWrapperRef = React.useRef<HTMLUListElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const debounceOnChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      setValue(event.target.value ?? '');

      if (!inputProps?.onChange) {
        return;
      }

      if (timeout.current !== null) {
        clearTimeout(timeout.current);
      }

      timeout.current = setTimeout(() => {
        inputProps.onChange?.(event);
      }, 250);
    };

    const changeFocusByArrowKey = React.useCallback((event: KeyboardEvent): void => {
      const currentElement = event.target as HTMLElement;

      if (!currentElement || !resultsWrapperRef?.current) {
        return;
      }

      const [isUp, isDown] = ['ArrowUp', 'ArrowDown'].map((key) => event.key === key);

      if (!isUp && !isDown) {
        return;
      }

      if (currentElement === inputRef?.current && isDown) {
        (resultsWrapperRef.current.firstChild as HTMLElement)?.focus();
        return;
      }

      if (isDown) {
        (currentElement?.nextElementSibling as HTMLElement)?.focus();
        return;
      } else {
        if (!currentElement?.previousElementSibling) {
          inputRef?.current?.focus();
          return;
        }
        (currentElement?.previousElementSibling as HTMLElement).focus();
      }
    }, []);

    React.useEffect(() => {
      const element = inputRef?.current;
      if (!element) {
        return;
      }
      element.addEventListener('keydown', changeFocusByArrowKey);

      return (): void => {
        element.removeEventListener('keydown', changeFocusByArrowKey);
      };
    }, [changeFocusByArrowKey]);

    React.useEffect(() => {
      const element = resultsWrapperRef?.current;
      if (!element) {
        return;
      }
      const children = element.children;
      for (let i = 0; i < children?.length; i++) {
        (children[i] as HTMLElement).addEventListener('keydown', changeFocusByArrowKey);
      }
      return (): void => {
        for (let i = 0; i < children?.length; i++) {
          (children[i] as HTMLElement).removeEventListener(
            'keydown',
            changeFocusByArrowKey,
          );
        }
      };
    }, [changeFocusByArrowKey, children]);

    return (
      <S.Wrapper className={className}>
        <S.Input
          ref={handleRefs(forwardedRef, inputRef)}
          {...inputProps}
          onChange={debounceOnChange}
          autoComplete="off"
        />
        {isLoading && <S.Spinner />}
        <S.ResultsWrapper ref={resultsWrapperRef}>
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

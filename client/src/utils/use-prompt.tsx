import { DialogModal } from 'components/DialogModal';
import React from 'react';
import styled from 'styled-components';

export function usePrompt(): {
  showPrompt: (accept: () => void, reject?: () => void) => void;
  Prompt: React.FC;
} {
  const [handles, setHandles] = React.useState<{
    accept: () => void;
    reject?: () => void;
  } | null>(null);

  const withHide = React.useCallback(
    (callback?: () => void) => {
      return (): void => {
        callback?.();
        setHandles(null);
      };
    },
    [setHandles],
  );

  const showPrompt = React.useCallback(
    (accept: () => void, reject?: () => void) => {
      setHandles((prev) => (prev !== null ? null : { accept, reject }));
    },
    [setHandles],
  );

  const renderPrompt: React.FC = React.useCallback(
    ({ children }) => {
      if (!handles) {
        return null;
      }
      return (
        <S.Dialog>
          <S.Message>{children}</S.Message>
          <S.Button tabIndex={0} onClick={withHide(handles.reject)}>
            No
          </S.Button>
          <S.Button onClick={withHide(handles.accept)}>Yes</S.Button>
        </S.Dialog>
      );
    },
    [handles, withHide],
  );

  return { showPrompt, Prompt: renderPrompt };
}

const S = {
  Dialog: styled(DialogModal)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 0fr 1fr;
    padding: 1rem;
    gap: 1rem;
  `,
  Form: styled.form``,
  Message: styled.span`
    grid-column: 1 / -1;
    font-size: 1rem;
  `,
  Button: styled.button`
    grid-row: 2;
    padding: 1rem;
  `,
};

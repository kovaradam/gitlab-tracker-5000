import React from 'react';
import styled from 'styled-components';
import { useKeyDown } from 'utils/use-key-down';
import { FormStyle } from '../style/form';
import { DialogModal } from './DialogModal';

type Props = {
  setTrackedTime: React.Dispatch<React.SetStateAction<number | null>>;
  hide: () => void;
};

export const AddTimeDialog: React.FC<Props> = ({ setTrackedTime, hide }) => {
  const inputs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  const submit: React.FormEventHandler = (event) => {
    event.preventDefault();
    if (inputs.some(({ current }) => !current)) {
      return;
    }
    const [hours, minutes] = inputs.map(({ current }) =>
      Number.parseInt(current?.value || '0'),
    );
    const timeToAdd = (hours * 60 * 60 + minutes * 60) * 1000;

    if (timeToAdd <= 0) {
      inputs[0].current?.focus();
      return;
    }

    setTrackedTime(timeToAdd);
    hide();
  };

  const [hoursInput, minutesInput] = inputs;

  React.useLayoutEffect(() => {
    const element = hoursInput.current;
    if (!element) {
      return;
    }
    element.focus();
  }, [hoursInput]);

  useKeyDown('Escape', hide);

  return (
    <S.Wrapper hide={hide}>
      <S.Form onSubmit={submit}>
        <S.Fieldset>
          <S.Input type="number" placeholder="hours" ref={hoursInput} />
          <S.Input type="number" placeholder="minutes" ref={minutesInput} />
        </S.Fieldset>
        <S.Submit>Add time</S.Submit>
      </S.Form>
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled(DialogModal)`
    height: min-content;
  `,
  Form: styled.form`
    padding: 1rem 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
  `,
  Fieldset: styled(FormStyle.Fieldset)`
    display: flex;
    justify-content: space-between;
    flex-direction: row;
  `,
  Input: styled(FormStyle.Input)`
    border-color: var(--main-color);
    width: 40%;
  `,
  Submit: styled(FormStyle.Submit)`
    width: 50%;
    font-size: 1rem;
    padding: 0.5rem;
  `,
};

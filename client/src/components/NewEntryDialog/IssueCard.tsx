import React from 'react';
import { GrFormClose } from 'react-icons/gr';
import styled from 'styled-components';
import { FormStyle } from '../../style/form';
import { formatTitle } from '../../utils/issues';
import { getTimeValuesFromMillis } from '../../utils/time';
import { Spinner } from '../LoadingOverlay';
import { IssueCard as IssueCardType } from './use-issue-cards';

export type Props = {
  card: IssueCardType;
  timeLeft: number;
  removeCard: () => void;
  updateCard: (card: IssueCardType) => void;
};

export const IssueCard: React.FC<Props> = ({
  card,
  timeLeft,
  removeCard,
  updateCard,
}) => {
  const trackedTimeValues = getTimeValuesFromMillis(card.time);
  const timeLeftValues = getTimeValuesFromMillis(timeLeft);
  const descriptionInput = React.useRef<HTMLTextAreaElement>(null);

  const timeInputRefs: Record<
    keyof typeof trackedTimeValues,
    React.RefObject<HTMLInputElement>
  > = {
    hours: React.useRef(null),
    minutes: React.useRef(null),
    seconds: React.useRef(null),
  };

  React.useEffect(() => {
    timeInputRefs.hours.current?.focus();
  }, [timeInputRefs.hours]);

  const updateTime = (): void => {
    function getValue(input: React.RefObject<HTMLInputElement>): number {
      const value = input.current?.value;
      if (!value) {
        return 0;
      }
      return Number(value);
    }
    const { hours, minutes, seconds } = timeInputRefs;

    const newTime =
      (getValue(hours) * 60 * 60 + getValue(minutes) * 60 + getValue(seconds)) * 1000;

    updateCard({ ...card, time: newTime });
  };

  const updateDescription = (): void => {
    const description = descriptionInput.current?.value ?? '';
    updateCard({ ...card, description });
  };

  return (
    <S.Wrapper data-id={card.cardId}>
      <S.Overlay onClick={(): void => updateCard({ ...card, isError: false })}>
        {card.isLoading ? <Spinner /> : card.isError && 'Something went wrong'}
      </S.Overlay>
      <S.CloseButton onClick={removeCard}>
        <GrFormClose />
      </S.CloseButton>
      <S.Title>
        <a rel="noopener noreferrer" target="_blank" href={card.webUrl}>
          {formatTitle(card)}
        </a>
      </S.Title>
      <S.IssueCardTimeInputWrapper>
        {Object.entries(trackedTimeValues).map(([key, value]) => (
          <S.IssueCardTimeInput key={key}>
            <S.Label htmlFor={key}>{key}</S.Label>
            <S.Input
              id={key}
              type="number"
              max={timeLeftValues[key as keyof typeof timeLeftValues] + value}
              min={0}
              defaultValue={value}
              ref={timeInputRefs[key as keyof typeof trackedTimeValues]}
              onChange={updateTime}
            />
          </S.IssueCardTimeInput>
        ))}
      </S.IssueCardTimeInputWrapper>
      <S.Fieldset>
        <S.Label>Description</S.Label>
        <S.Input onBlur={updateDescription} as="textarea" ref={descriptionInput} />
      </S.Fieldset>
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.li`
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    box-shadow: var(--base-shadow);
    color: var(--main-color);
    border: 1px dashed var(--grey);
    gap: 1rem;
    overflow: hidden;
  `,
  Title: styled.header`
    font-size: 1rem;
    width: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  Overlay: styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: #80808053;
    margin: -0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 1.2rem;

    &:empty {
      display: none;
    }
  `,
  CloseButton: styled.button.attrs({ type: 'button' })`
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    box-shadow: none;
    padding: 2px;
    font-size: 1.5rem;

    & * {
      stroke: var(--grey);
    }
  `,
  IssueCardTimeInputWrapper: styled(FormStyle.Fieldset)`
    flex-direction: row;
    justify-content: space-evenly;
  `,
  IssueCardTimeInput: styled.span`
    display: flex;
    justify-content: center;
    align-items: baseline;
    flex-direction: column;
    gap: 3px;

    & > input {
      padding: 5px;

      text-align: center;
      width: 3rem;
    }
  `,
  Fieldset: styled(FormStyle.Fieldset)`
    width: 100%;
  `,
  Label: styled(FormStyle.Label)`
    color: var(--main-color);
    font-size: 0.7rem;
  `,
  Submit: styled(FormStyle.Submit)``,
  Input: styled(FormStyle.Input)`
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--grey);
    resize: none;
  `,
};

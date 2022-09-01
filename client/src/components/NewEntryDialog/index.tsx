import React from 'react';
import styled from 'styled-components';
import { GrFormClose } from 'react-icons/gr';
import { getTimeValuesFromMillis } from '../../utils/time';
import { FormStyle } from '../../style/form';
import { IssueCard, Props as IssueCardProps } from './IssueCard';
import { SearchInput, SearchResult } from './SearchInput';
import { useGqlQuery } from '../../store/use-graphql-query';
import {
  GetSearchQueryResponse,
  GetSearchVariables,
  GET_SEARCH_ISSUES,
  Issue,
  useSubmitIssue,
} from './queries';
import { IssueCard as IssueCardType, useIssueCards } from './use-issue-cards';
import { formatTitle } from '../../utils/issues';
import { AnimatedValue } from '../AnimatedValue';
import { createIssueNote, areValidErrors } from './utils';
import { DialogModal } from '../DialogModal';
import { dots } from '../../style/animation';
import { usePrompt } from 'utils/use-prompt';
import { useKeyDown } from 'utils/use-key-down';
import { queryClient } from 'index';

type Props = {
  discardEntry: (success?: boolean) => void;
  trackedTime: number;
  setTrackedTime: React.Dispatch<React.SetStateAction<number | null>>;
};

export const NewEntryDialog: React.FC<React.PropsWithChildren<Props>> = ({
  discardEntry,
  setTrackedTime,
  trackedTime,
}) => {
  const { cards, addCard, updateCard, removeCard } = useIssueCards();
  const issueInputRef = React.useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = React.useState('');
  const { data, isLoading } = useGqlQuery<GetSearchQueryResponse, GetSearchVariables>(
    GET_SEARCH_ISSUES,
    {
      queryKey: ['search', searchValue.length > 3 ? searchValue : ''],
      variables: { search: searchValue },
    },
  );

  const issues = React.useMemo(
    () =>
      data?.projects.nodes
        .map(({ issues, name }) =>
          issues.nodes.map((issue) => ({ ...issue, projectName: name })),
        )
        .reduce((prev, current) => prev.concat(current), []),
    [data],
  );

  const submitIssue = useSubmitIssue();

  const submit: React.FormEventHandler = (event): void => {
    event.preventDefault();
    const results = cards?.map(async (card) => {
      updateCard({ ...card, isLoading: true });
      const issueNote = createIssueNote(card);
      return submitIssue(issueNote).then((response) => {
        if (response === null || areValidErrors(response.createNote.errors)) {
          updateCard({ ...card, isError: true, isLoading: false });
          return;
        }
        removeCard(card.cardId);
        setTrackedTime((prev) => (prev ?? 0) - card.time);
      });
    });
    Promise.all(results)
      .then(() => {
        queryClient.invalidateQueries();
        queryClient.refetchQueries(['dashboard']);
      })
      .catch(() => {
        queryClient.invalidateQueries();
      });
  };

  const searchInputHandler: React.ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => {
    setSearchValue(value);
  };

  const createSearchResultClickHandler = (issue: Issue) => {
    return (): void => {
      if (issueInputRef.current) {
        issueInputRef.current.value = '';
        issueInputRef.current.blur();
      }
      addCard({ ...issue, time: timeLeft });
    };
  };

  const createSearchResultKeyHandler = (issue: Issue): React.KeyboardEventHandler => {
    const clickHandler = createSearchResultClickHandler(issue);
    return (event): void => {
      if (event.key !== 'Enter') {
        return;
      }
      event.preventDefault();
      clickHandler();
    };
  };

  const createCardProps = (card: IssueCardType): IssueCardProps => {
    return {
      card,
      updateCard,
      removeCard: (): void => removeCard(card.cardId),
      timeLeft,
    };
  };

  const timeLeft = React.useMemo(
    () =>
      trackedTime -
      cards.map(({ time }) => time).reduce((prev, current) => prev + current, 0),
    [cards, trackedTime],
  );

  React.useLayoutEffect(() => {
    if (trackedTime <= 0) {
      discardEntry(true);
    }
  });

  const timeValues = getTimeValuesFromMillis(timeLeft);

  const issueInputId = 'issue-input';

  const { showPrompt, Prompt } = usePrompt();

  const handleCloseAction = (): void => {
    showPrompt(discardEntry);
  };

  useKeyDown('Escape', handleCloseAction);

  return (
    <S.Wrapper>
      <S.CloseButton onClick={handleCloseAction}>
        <GrFormClose />
      </S.CloseButton>
      <S.Header>New Entry</S.Header>
      <S.Form>
        <section>
          <S.Label>Time to add:</S.Label>
          <S.InfoList>
            {Object.entries(timeValues).map(([key, value]) => (
              <S.InfoValue key={key}>
                <AnimatedValue>{value}</AnimatedValue>
                <span>{key}</span>
              </S.InfoValue>
            ))}
          </S.InfoList>
        </section>
        <S.Fieldset>
          <S.Label htmlFor={issueInputId}>Issue:</S.Label>
          <S.SearchInput
            onChange={searchInputHandler}
            disabled={timeLeft === 0}
            ref={issueInputRef}
            id={issueInputId}
            autoFocus
          >
            {isLoading ? (
              <S.SearchResultPlaceholder data-loading>Loading</S.SearchResultPlaceholder>
            ) : issues?.length ? (
              issues.map((issue) => (
                <S.SearchResult
                  key={issue.id}
                  onClick={createSearchResultClickHandler(issue)}
                  onKeyDown={createSearchResultKeyHandler(issue)}
                  tabIndex={0}
                >
                  <span>{formatTitle(issue)}</span>
                  <span>{issue.projectName}</span>
                </S.SearchResult>
              ))
            ) : (
              <S.SearchResultPlaceholder>No issues found</S.SearchResultPlaceholder>
            )}
          </S.SearchInput>
        </S.Fieldset>
        <S.IssueCardList>
          {cards.map((card) => (
            <IssueCard key={card.cardId} {...createCardProps(card)} />
          ))}
        </S.IssueCardList>
        {cards.length !== 0 ? (
          <S.Submit onClick={submit} disabled={cards.some(({ isLoading }) => isLoading)}>
            Submit
          </S.Submit>
        ) : (
          <S.NoIssueMessage htmlFor={issueInputId}>Select an issue</S.NoIssueMessage>
        )}
      </S.Form>
      <Prompt>Are you sure?</Prompt>
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled(DialogModal)`
    height: 30rem;
  `,
  CloseButton: styled.button`
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    box-shadow: none;
    font-size: 1.9rem;

    & * {
      stroke: var(--main-color);
    }
  `,
  Header: styled.header`
    font-size: 2rem;
    color: var(--main-color);
    border-bottom: 1px dashed var(--grey);
    padding: 1rem;
  `,
  Form: styled.form`
    flex-grow: 1;
    display: flex;
    padding: 1rem;
    gap: 1rem;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
  `,
  InfoList: styled.ul`
    display: flex;
    flex-direction: column;
    padding-left: 1rem;
  `,
  InfoValue: styled.li`
    font-size: 1rem;
    display: flex;
    gap: 0.5rem;
    & > *:first-child {
      color: var(--main-color);
    }
  `,

  Fieldset: styled(FormStyle.Fieldset)`
    z-index: 2;
    width: 100%;
  `,
  Label: styled(FormStyle.Label)`
    color: var(--main-color);
  `,
  Submit: styled(FormStyle.Submit)``,
  SearchInput: styled(SearchInput)`
    width: 100%;
    & input {
      width: 100%;
      box-sizing: border-box;
      border-color: var(--main-color);
    }
  `,
  IssueCardList: styled.ul`
    padding: 0;
    gap: 1rem;
    display: flex;
    flex-direction: column;
  `,
  SearchResult: styled(SearchResult)`
    display: flex;
    flex-direction: column;

    & > span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    & > span:last-child {
      color: grey;
      font-size: 0.8em;
    }
  `,
  SearchResultPlaceholder: styled(SearchResult)`
    color: #9f9f9f;
    &[data-loading]::after {
      content: '';
      animation: ${dots} 2s linear infinite;
    }
  `,
  NoIssueMessage: styled.label`
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 400;
    font-size: 2rem;
    color: var(--grey);
  `,
};

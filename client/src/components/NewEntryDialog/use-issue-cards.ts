import React from 'react';
import { IssueCard } from './IssueCard';
import { Issue } from './queries';

export type IssueCard = Issue & {
  cardId: number;
  time: number;
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
};

const idGenerator = (function* (): Generator<number> {
  for (let id = 0; true; id++) {
    yield id;
  }
})();

export function useIssueCards(): {
  addCard: (card: Omit<IssueCard, 'cardId'>) => void;
  updateCard: (card: IssueCard) => void;
  removeCard: (id: number) => void;
  cards: IssueCard[];
} {
  const [cards, setCards] = React.useState<IssueCard[]>([]);

  const addCard = React.useCallback(
    (card: Omit<IssueCard, 'cardId'>) => {
      const newCard = { ...card, cardId: idGenerator.next().value };
      setCards((prev) => [newCard].concat(prev));
    },
    [setCards],
  );

  const removeCard = React.useCallback(
    (cardId: number) => {
      setCards((prev) => prev.filter((card) => card.cardId !== cardId));
    },
    [setCards],
  );

  const updateCard = React.useCallback(
    (newCard: IssueCard) => {
      setCards((prev) =>
        prev.map((card) => {
          if (card.cardId !== newCard.cardId) {
            return card;
          }
          return { ...card, ...newCard };
        }),
      );
    },
    [setCards],
  );

  return React.useMemo(
    () => ({ addCard, removeCard, updateCard, cards }),
    [addCard, removeCard, updateCard, cards],
  );
}

import React from "react";
import { useAppSelector } from "../../../hooks";
import { selectDuellist } from "../../duelSlice";
import { useDuellistActions } from "../../useDuellistActions";

interface Props {
  duellistKey: DuellistKey;
}

export const DuellistDeck = ({ duellistKey }: Props) => {
  const { deck } = useAppSelector(selectDuellist(duellistKey));
  const { shuffle } = useDuellistActions(duellistKey);

  return (
    <>
      <div>
        Deck:&nbsp;
        <button onClick={() => shuffle()}>Shuffle</button>
        <ol>
          {deck.slice(0, 5).map((card, idx) => (
            <li key={idx}>{card.name}</li>
          ))}
          {deck.length > 5 ? <i>{deck.length - 5} more...</i> : ""}
        </ol>
      </div>
    </>
  );
};

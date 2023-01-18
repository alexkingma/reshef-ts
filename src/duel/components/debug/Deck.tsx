import { selectDuellist } from "@/duel/duelSlice";
import { useDuellistActions } from "@/duel/useDuelActions";
import { useAppSelector } from "@/hooks";
import React from "react";

interface Props {
  duellistKey: DuellistKey;
}

export const Deck = ({ duellistKey }: Props) => {
  const { deck } = useAppSelector(selectDuellist(duellistKey));
  const { shuffle } = useDuellistActions(duellistKey);

  return (
    <>
      <div>
        Deck:&nbsp;
        <button onClick={() => shuffle()}>Shuffle</button>
        <ol>
          {deck.slice(0, 5).map((z, idx) => (
            <li key={idx}>{z.card.name}</li>
          ))}
          {deck.length > 5 ? <i>{deck.length - 5} more...</i> : ""}
        </ol>
      </div>
    </>
  );
};

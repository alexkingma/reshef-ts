import React from "react";

import { DuelPartialDispatchActions } from "../coreDuelReducers";

type Props = Pick<DuellistDuelState, "deck"> &
  Pick<DuelPartialDispatchActions, "shuffle" | "drawCard">;

export const DuellistDeck = ({ deck, shuffle, drawCard }: Props) => {
  return (
    <>
      <div>
        Deck:&nbsp;
        <button onClick={shuffle}>Shuffle</button>
        <button onClick={drawCard}>Draw</button>
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

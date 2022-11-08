import React from "react";

import { useAppSelector, useAppDispatch } from "../hooks";
import { shuffleDeck, addLP, selectDuelPlayer, drawCard } from "./duelSlice";

export const Duel = () => {
  const p1 = useAppSelector(selectDuelPlayer);
  const dispatch = useAppDispatch();

  return (
    <div>
      LP: {p1.lp}&nbsp;
      <button onClick={() => dispatch(addLP(1000))}>+1000</button>
      <div>
        Hand:
        <ol>
          {p1.hand.map((card, idx) => (
            <li key={idx}>{card.name}</li>
          ))}
        </ol>
      </div>
      <div>
        Deck:
        <ol>
          {p1.deck.map((card, idx) => (
            <li key={idx}>{card.name}</li>
          ))}
        </ol>
      </div>
      <button onClick={() => dispatch(shuffleDeck())}>Shuffle</button>
      <button onClick={() => dispatch(drawCard())}>Draw</button>
    </div>
  );
};

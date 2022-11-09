import React from "react";

import useDuelReducer from "./useDuellistReducer";

interface Props {
  name: string;
  cardQuantMap: CardQuantityMap;
}

export const Duellist = ({ name, cardQuantMap }: Props) => {
  const { state, addLP, subtractLP, shuffle, drawCard } =
    useDuelReducer(cardQuantMap);

  return (
    <div>
      <h5>{name}</h5>
      LP: {state.lp}&nbsp;
      <button onClick={() => addLP(1500)}>+1500</button>
      <button onClick={() => subtractLP(200)}>-200</button>
      <div>
        Hand:
        <ol>
          {state.hand.map((card, idx) => (
            <li key={idx}>{card.name}</li>
          ))}
        </ol>
      </div>
      <div>
        Deck:
        <ol>
          {state.deck.map((card, idx) => (
            <li key={idx}>{card.name}</li>
          ))}
        </ol>
      </div>
      <button onClick={shuffle}>Shuffle</button>
      <button onClick={drawCard}>Draw</button>
    </div>
  );
};

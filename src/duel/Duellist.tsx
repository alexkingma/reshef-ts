import React, { useReducer } from "react";
import produce from "immer";

import { draw, generateNewDuellistDuelState, shuffle } from "./duelUtil";

interface Props {
  name: string;
  cardQuantMap: CardQuantityMap;
}

interface DuelAction {
  type: string;
  payload?: any;
}

const duelReducer = (
  state: DuellistDuelState,
  action: DuelAction
): DuellistDuelState =>
  produce(state, (draft) => {
    const reducers = {
      shuffle: () => {
        draft.deck = shuffle(draft.deck);
      },
      drawCard: () => {
        const { card, deck } = draw(draft.deck);
        draft.deck = deck;
        draft.hand.push(card);
      },
      addLP: () => {
        draft.lp += action.payload;
      },
    };
    const reducer = reducers[action.type as keyof typeof reducers];
    if (!reducer) {
      throw new Error(`Unknown reducer called: ${action.type}!`);
    }
    reducer();
  });

export const Duellist = ({ name, cardQuantMap }: Props) => {
  const initialState = generateNewDuellistDuelState(cardQuantMap);
  const [state, dispatch] = useReducer(duelReducer, initialState);

  return (
    <div>
      <h5>{name}</h5>
      LP: {state.lp}&nbsp;
      <button onClick={() => dispatch({ type: "addLP", payload: 1000 })}>
        +1000
      </button>
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
      <button onClick={() => dispatch({ type: "shuffle" })}>Shuffle</button>
      <button onClick={() => dispatch({ type: "drawCard" })}>Draw</button>
    </div>
  );
};

import { useReducer } from "react";
import produce from "immer";

import { draw, generateNewDuellistDuelState, shuffle } from "./duelUtil";

interface DuellistAction {
  type: DuellistActionType;
  payload?: any;
}

type DuellistReducers = {
  [key in DuellistActionType]: () => void;
};

enum DuellistActionType {
  AddLP = "ADD_LP",
  SubtractLP = "SUBTRACT_LP",
  Shuffle = "SHUFFLE",
  DrawCard = "DRAW_CARD",
}

const duellistReducer = (
  state: DuellistDuelState,
  action: DuellistAction
): DuellistDuelState =>
  produce(state, (draft) => {
    const reducers: DuellistReducers = {
      [DuellistActionType.Shuffle]: () => {
        draft.deck = shuffle(draft.deck);
      },
      [DuellistActionType.DrawCard]: () => {
        const { card, deck } = draw(draft.deck);
        draft.deck = deck;
        draft.hand.push(card);
      },
      [DuellistActionType.AddLP]: () => {
        draft.lp += action.payload;
      },
      [DuellistActionType.SubtractLP]: () => {
        draft.lp = Math.max(draft.lp - action.payload, 0);
      },
    };
    reducers[action.type]();
  });

const useDuelReducer = (cardQuantMap: CardQuantityMap) => {
  const initialState = generateNewDuellistDuelState(cardQuantMap);
  const [state, dispatch] = useReducer(duellistReducer, initialState);

  return {
    state,
    addLP: (payload: number) =>
      dispatch({ type: DuellistActionType.AddLP, payload }),
    subtractLP: (payload: number) =>
      dispatch({ type: DuellistActionType.SubtractLP, payload }),
    shuffle: () => dispatch({ type: DuellistActionType.Shuffle }),
    drawCard: () => dispatch({ type: DuellistActionType.DrawCard }),
  };
};

export default useDuelReducer;

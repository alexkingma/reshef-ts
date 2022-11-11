import { useReducer } from "react";
import produce from "immer";

import { generateNewDuellistDuelState } from "./duelUtil";
import {
  getCoreDuelDispatchActions,
  coreDuelReducers,
  DuelAction,
} from "./coreDuelReducers";

const duelReducer = (state: DuelState, action: DuelAction): DuelState =>
  produce(state, (draft) => {
    const reducers = { ...coreDuelReducers };
    const originatorState = draft[action.duellistKey];
    const targetState = draft[action.duellistKey === "p1" ? "p2" : "p1"];
    reducers[action.type]({
      originatorState,
      targetState,
      payload: action.payload,
    });
  });

const useDuelReducer = (
  p1CardMap: CardQuantityMap,
  p2CardMap: CardQuantityMap
) => {
  const initialState = {
    p1: generateNewDuellistDuelState(p1CardMap),
    p2: generateNewDuellistDuelState(p2CardMap),
  };
  const [state, dispatch] = useReducer(duelReducer, initialState);

  return {
    state,
    dispatchActions: {
      ...getCoreDuelDispatchActions(dispatch),
    },
  };
};

export default useDuelReducer;

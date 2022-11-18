import produce from "immer";
import { useReducer } from "react";

import {
  coreDuelReducers,
  DuelAction,
  getCoreDuelDispatchActions,
} from "./coreDuelReducers";
import { getInitialDuelState, getOtherDuellistKey } from "./duelUtil";

const duelReducer = (state: DuelState, action: DuelAction): DuelState =>
  produce(state, (draft) => {
    const reducers = { ...coreDuelReducers };
    const originatorState = draft[action.duellistKey];
    const targetState = draft[getOtherDuellistKey(action.duellistKey)];
    reducers[action.type]({
      originatorState,
      targetState,
      activeTurn: draft.activeTurn,
      payload: action.payload,
    });
  });

const useDuelReducer = (
  p1CardMap: CardQuantityMap,
  p2CardMap: CardQuantityMap
) => {
  const initialState = getInitialDuelState(p1CardMap, p2CardMap);
  const [state, dispatch] = useReducer(duelReducer, initialState);

  return {
    state,
    dispatchActions: {
      ...getCoreDuelDispatchActions(dispatch),
    },
  };
};

export default useDuelReducer;

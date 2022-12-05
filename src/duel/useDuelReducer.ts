import produce from "immer";
import { useReducer } from "react";

import {
  CoreDuelAction,
  coreDuelReducers,
  getCoreDuelDispatchActions,
} from "./coreDuelReducers";
import { getInitialDuel, getOtherDuellistKey } from "./duelUtil";
import {
  getSpellEffectDispatchActions,
  SpellEffectAction,
  spellEffectReducers,
} from "./spellEffectReducers";

export interface ReducerArgs {
  state: Duel;
  originatorState: Duellist;
  targetState: Duellist;
  activeTurn: Turn;
  payload: any;
}

type DuelAction = CoreDuelAction | SpellEffectAction;

const duelReducer = (state: Duel, action: DuelAction): Duel =>
  produce(state, (draft) => {
    const reducers = { ...coreDuelReducers, ...spellEffectReducers };
    const originatorState = draft[action.duellistKey];
    const targetState = draft[getOtherDuellistKey(action.duellistKey)];
    reducers[action.type]({
      state: draft, // only use when other props cannot be lastingly referenced in reducer
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
  const initialState = getInitialDuel(p1CardMap, p2CardMap);
  const [state, dispatch] = useReducer(duelReducer, initialState);

  return {
    state,
    coreDispatches: {
      ...getCoreDuelDispatchActions(dispatch),
    },
    spellEffectDispatches: {
      ...getSpellEffectDispatchActions(dispatch),
    },
  };
};

export default useDuelReducer;

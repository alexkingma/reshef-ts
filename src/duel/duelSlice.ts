import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { Field, FieldCoords } from "./common";
import { coreDuelReducers } from "./coreDuelReducers";
import {
  getInitialDuel,
  getOtherDuellistKey,
  getTempCardQuantMap,
  getZone,
} from "./duelUtil";

export interface ReducerArg {
  state: Duel;
  originatorState: Duellist;
  targetState: Duellist;
  activeTurn: Turn;
  activeField: Field;
}

export type DuelActionKey = keyof typeof coreDuelReducers;
type CustomDuelReducers = {
  [K in DuelActionKey]: (arg: ReducerArg, ...payload: any[]) => void;
};
type DuelReducers = {
  [K in DuelActionKey]: (
    state: Duel,
    action: PayloadAction<{
      duellistKey: DuellistKey;
      payload: Parameters<typeof coreDuelReducers[K]>[1];
    }>
  ) => void;
};

const playerCardMap = getTempCardQuantMap();
const opponentCardMap = getTempCardQuantMap();
const initialState: Duel = getInitialDuel(playerCardMap, opponentCardMap);

const transform = (map: CustomDuelReducers) => {
  const transformedMap = {} as DuelReducers;
  for (let key in map) {
    transformedMap[key as DuelActionKey] = (state, action) => {
      const duellistKey = action.payload.duellistKey;
      const originatorState = state[duellistKey];
      const targetState = state[getOtherDuellistKey(duellistKey)];
      const customArg = {
        state, // only use when other props cannot be lastingly referenced in reducer
        originatorState,
        targetState,
        activeTurn: state.activeTurn,
        activeField: state.activeField,
      };
      map[key as DuelActionKey](customArg, action.payload.payload);
    };
  }
  return transformedMap;
};

export const duelSlice = createSlice({
  name: "duel",
  initialState,
  reducers: transform(coreDuelReducers),
});

export const { actions } = duelSlice;

export const selectDuel = (state: RootState) => state.duel;
export const selectZone = (coords: FieldCoords) => (state: RootState) =>
  getZone(state.duel, coords);
export const selectIsMyTurn = (key: DuellistKey) => (state: RootState) =>
  state.duel.activeTurn.duellistKey === key;
export const selectDuellist = (key: DuellistKey) => (state: RootState) =>
  state.duel[key] as Duellist;
export const selectActiveTurn = (state: RootState) => state.duel.activeTurn;

export default duelSlice.reducer;

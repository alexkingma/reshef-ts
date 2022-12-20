import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { cardReducers } from "./cardReducers";
import { Field } from "./common";
import { duellistReducers } from "./duellistReducers";
import {
  checkAutoEffects,
  getInitialDuel,
  getStateMap,
  getTempCardQuantMap,
  getZone,
} from "./duelUtil";

export interface StateMap {
  state: Duel;
  originatorState: Duellist;
  targetState: Duellist;
  activeTurn: Turn;
  activeField: Field;
}

export interface DuellistCoordsMap {
  dKey: DuellistKey;
  otherDKey: DuellistKey;

  // own rows
  ownMonsters: RowCoords;
  ownSpellTrap: RowCoords;
  ownHand: RowCoords;

  // opponent rows
  otherMonsters: RowCoords;
  otherSpellTrap: RowCoords;
  otherHand: RowCoords;
}

export type ZoneCoordsMap = DuellistCoordsMap & {
  zoneCoords: ZoneCoords;
  colIdx: FieldCol;
};

export type CoordsMap = ZoneCoordsMap | DuellistCoordsMap;

export type CardActionKey = keyof typeof cardReducers;
export type DuellistActionKey = keyof typeof duellistReducers;
type DuelActionKey = CardActionKey | DuellistActionKey;
type CustomDuelReducers = {
  [K in DuelActionKey]: (
    stateMap: StateMap,
    coordsMap: K extends CardActionKey ? ZoneCoordsMap : DuellistCoordsMap
  ) => void;
};
type DuelReducers = {
  [K in DuelActionKey]: (
    state: Duel,
    action: PayloadAction<
      K extends CardActionKey ? ZoneCoordsMap : DuellistCoordsMap
    >
  ) => void;
};

const playerCardMap = getTempCardQuantMap();
const opponentCardMap = getTempCardQuantMap();
const initialState: Duel = getInitialDuel(playerCardMap, opponentCardMap);

const transform = (map: CustomDuelReducers) => {
  const transformedMap = {} as DuelReducers;
  for (let key in map) {
    transformedMap[key as CardActionKey] = (state, action) => {
      const { dKey } = action.payload;
      const stateMap = getStateMap(state, dKey);
      map[key as DuelActionKey](stateMap, action.payload);

      if (key !== "endTurn") {
        // after every core dispatch to the field state as above,
        // the entire field passive/auto effects need to be recalculated

        // endTurn() effectively inverts what the "originator" and
        // "target" states refer to, causing auto effects to
        // target the wrong side of the field.
        // There are no effects that should run upon a turn ending in any case;
        // start-of-turn events only happen after a card has been drawn,
        // text has been displayed, etc.

        // TODO: check isStartOfTurn flag instead of key matching
        checkAutoEffects(stateMap);
      }
    };
  }
  return transformedMap;
};

export const duelSlice = createSlice({
  name: "duel",
  initialState,
  reducers: transform({ ...cardReducers, ...duellistReducers }),
});

export const { actions } = duelSlice;

export const selectDuel = (state: RootState) => state.duel;
export const selectZone = (coords: ZoneCoords) => (state: RootState) =>
  getZone(state.duel, coords);
export const selectIsMyTurn = (key: DuellistKey) => (state: RootState) =>
  state.duel.activeTurn.duellistKey === key;
export const selectDuellist = (key: DuellistKey) => (state: RootState) =>
  state.duel[key] as Duellist;
export const selectActiveTurn = (state: RootState) => state.duel.activeTurn;

export default duelSlice.reducer;

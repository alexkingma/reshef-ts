import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { cardReducers } from "./cardReducers";
import { RowKey } from "./common";
import { duellistReducers } from "./duellistReducers";
import {
  checkAutoEffects,
  getInitialDuel,
  getOtherDuellistKey,
  getRow,
  getTempCardQuantMap,
  getZone,
  hasMatchInRow,
} from "./duelUtil";
import { interactionReducers } from "./interactionReducers";

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
export type InteractionActionKey = keyof typeof interactionReducers;

type DuelActionKey = CardActionKey | DuellistActionKey | InteractionActionKey;
type CustomDuelReducers = {
  [K in DuelActionKey]: (
    state: Duel,
    coordsMap: K extends CardActionKey
      ? ZoneCoordsMap
      : K extends InteractionActionKey
      ? ExtractSecondArg<typeof interactionReducers[K]>
      : DuellistCoordsMap
  ) => void;
};

type DuelReducers = {
  [K in DuelActionKey]: (
    state: Duel,
    action: PayloadAction<
      K extends CardActionKey
        ? ZoneCoordsMap
        : K extends InteractionActionKey
        ? ExtractSecondArg<typeof interactionReducers[K]>
        : DuellistCoordsMap
    >
  ) => void;
};

const playerCardMap = getTempCardQuantMap();
const opponentCardMap = getTempCardQuantMap();
const initialState: Duel = getInitialDuel(playerCardMap, opponentCardMap);

const transform = (map: CustomDuelReducers) => {
  const transformedMap = {} as DuelReducers;
  for (let key in map) {
    transformedMap[key as DuelActionKey] = (state, action) => {
      map[key as DuelActionKey](state, action.payload as any);

      if (key !== "endTurn" && !(key in interactionReducers)) {
        // after every core dispatch to the field state as above,
        // the entire field passive/auto effects need to be recalculated

        // However, once endTurn has been dispatched and isStartOfTurn is set,
        // the target/originator states essentially get swapped, causing buggy
        // behaviour until the cycle has been started fresh from a new dispatch.
        // Since no events need to be reacted to immediately post-endTurn events,
        // we can safely ignore this round of checks in favour of waiting for the
        // start-of-turn dispatch, which prompts "It's my turn" dialogue, card-
        // drawing, start-of-turn-only effects, etc.
        checkAutoEffects(state);
      }
    };
  }
  return transformedMap;
};

export const duelSlice = createSlice({
  name: "duel",
  initialState,
  reducers: transform({
    ...cardReducers,
    ...duellistReducers,
    ...interactionReducers,
  }),
});

export const { actions } = duelSlice;

export const selectDuel = ({ duel }: RootState) => duel;
export const selectRow =
  (rowCoords: RowCoords) =>
  ({ duel }: RootState) =>
    getRow(duel, rowCoords);
export const selectZone =
  (coords: ZoneCoords) =>
  ({ duel }: RootState) =>
    getZone(duel, coords);
export const selectOpponentHasMonster =
  (dKey: DuellistKey) =>
  ({ duel }: RootState) =>
    hasMatchInRow(duel, [getOtherDuellistKey(dKey), RowKey.Monster]);
export const selectIsMyTurn =
  (key: DuellistKey) =>
  ({ duel }: RootState) =>
    duel.activeTurn.duellistKey === key;
export const selectDuellist =
  (key: DuellistKey) =>
  ({ duel }: RootState) =>
    duel[key] as Duellist;
export const selectInteraction = ({ duel }: RootState) => duel.interaction;
export const selectActiveTurn = ({ duel }: RootState) => duel.activeTurn;

export default duelSlice.reducer;

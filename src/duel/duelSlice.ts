import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { DuellistStatus, RowKey } from "./common";
import { cardReducers } from "./reducers/cardReducers";
import { duelReducers } from "./reducers/duelReducers";
import { duellistReducers } from "./reducers/duellistReducers";
import { interactionReducers } from "./reducers/interactionReducers";
import { checkAutoEffects } from "./util/autoEffectUtil";
import { getRandomDuel } from "./util/duelUtil";
import { getOtherDuellistKey } from "./util/duellistUtil";
import { getFieldZone } from "./util/fieldUtil";
import { getRow, hasMatchInRow } from "./util/rowUtil";
import { getZone } from "./util/zoneUtil";

export type CardActionKey = keyof typeof cardReducers;
export type DuellistActionKey = keyof typeof duellistReducers;
export type InteractionActionKey = keyof typeof interactionReducers;
export type DuelActionKey = keyof typeof duelReducers;

type UnionDuelActionKey =
  | CardActionKey
  | DuellistActionKey
  | InteractionActionKey
  | DuelActionKey;
type CustomDuelReducers = {
  [K in UnionDuelActionKey]: (
    state: Duel,
    coordsMap: K extends CardActionKey
      ? ZoneCoordsMap
      : K extends InteractionActionKey
      ? ExtractSecondArg<typeof interactionReducers[K]>
      : K extends DuelActionKey
      ? ExtractSecondArg<typeof duelReducers[K]>
      : DuellistCoordsMap
  ) => void;
};

type DuelReducers = {
  [K in UnionDuelActionKey]: (
    state: Duel,
    action: PayloadAction<
      K extends CardActionKey
        ? ZoneCoordsMap
        : K extends InteractionActionKey
        ? ExtractSecondArg<typeof interactionReducers[K]>
        : K extends DuelActionKey
        ? ExtractSecondArg<typeof duelReducers[K]>
        : DuellistCoordsMap
    >
  ) => void;
};

const initialState: Duel = getRandomDuel();

const transform = (map: CustomDuelReducers) => {
  const transformedMap = {} as DuelReducers;
  for (let key in map) {
    transformedMap[key as UnionDuelActionKey] = (state, action) => {
      map[key as UnionDuelActionKey](state, action.payload as any);

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
    ...duelReducers,
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
export const selectCursorZone = ({ duel }: RootState) =>
  getZone(duel, duel.interaction.cursorCoords);
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
    duel[key];
export const selectGraveyardZone =
  (key: DuellistKey) =>
  ({ duel }: RootState) =>
    duel[key].graveyard[0];
export const selectActiveField =
  (key: DuellistKey) =>
  ({ duel }: RootState) =>
    getFieldZone(duel, key);
export const selectInteraction = ({ duel }: RootState) => duel.interaction;
export const selectActiveTurn = ({ duel }: RootState) => duel.activeTurn;
export const selectConfig = ({ duel }: RootState) => duel.config;
export const selectIsComputer =
  (key: DuellistKey) =>
  ({ duel }: RootState) =>
    key === "p1"
      ? duel.config.p1Type === "computer"
      : duel.config.p2Type === "computer";
export const selectIsDuelOver = ({ duel }: RootState) => {
  // determine if either side has fulfilled a win/lose condition
  return (
    duel.p1.status !== DuellistStatus.HEALTHY ||
    duel.p2.status !== DuellistStatus.HEALTHY
  );
};

export default duelSlice.reducer;

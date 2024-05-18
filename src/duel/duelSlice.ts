import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { DKey, PlayerType, RowKey } from "./enums/duel";
import { cardReducers } from "./reducers/cardReducers";
import { duelReducers } from "./reducers/duelReducers";
import { duellistReducers } from "./reducers/duellistReducers";
import { interactionReducers } from "./reducers/interactionReducers";
import { checkAutoEffects } from "./util/autoEffectUtil";
import { draw } from "./util/deckUtil";
import { getEmptyDuel, isDuelOver, isStartOfEitherTurn } from "./util/duelUtil";
import { getOtherDuellistKey, isPlayer } from "./util/duellistUtil";
import { getActiveField, getFieldCard } from "./util/fieldUtil";
import { getRow, hasMatchInRow } from "./util/rowUtil";
import { getZone, isFaceUp, isOccupied } from "./util/zoneUtil";

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
        ? ExtractSecondArg<(typeof interactionReducers)[K]>
        : K extends DuelActionKey
          ? ExtractSecondArg<(typeof duelReducers)[K]>
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
          ? ExtractSecondArg<(typeof interactionReducers)[K]>
          : K extends DuelActionKey
            ? ExtractSecondArg<(typeof duelReducers)[K]>
            : DuellistCoordsMap
    >
  ) => void;
};

const initialState: Duel = getEmptyDuel();

const transform = (map: CustomDuelReducers) => {
  const transformedMap = {} as DuelReducers;
  for (let key in map) {
    transformedMap[key as UnionDuelActionKey] = (state, action) => {
      map[key as UnionDuelActionKey](state, action.payload as any);

      // interaction actions don't modify board state
      if (key in interactionReducers) return;

      // Automatic actions baked into the engine:
      //   1. Draw a card at the start of each turn.
      //   2. Recompute passive/auto effects of whole
      //      board after each discrete action.
      if (isStartOfEitherTurn(state)) {
        draw(state, state.activeTurn.dKey);
        checkAutoEffects(state);
        state.activeTurn.isStartOfTurn = false;
      } else {
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
  (dKey: DKey) =>
  ({ duel }: RootState) =>
    hasMatchInRow(duel, [getOtherDuellistKey(dKey), RowKey.Monster]);
export const selectIsMyTurn =
  (dKey: DKey) =>
  ({ duel }: RootState) =>
    duel.activeTurn.dKey === dKey;
export const selectDuellist =
  (dKey: DKey) =>
  ({ duel }: RootState) =>
    duel.duellists[dKey];
export const selectGraveyardZone =
  (dKey: DKey) =>
  ({ duel }: RootState) =>
    duel.duellists[dKey].graveyard[0];
export const selectFieldCard =
  (dKey: DKey) =>
  ({ duel }: RootState) =>
    getFieldCard(duel, dKey);
export const selectActiveField = ({ duel }: RootState) => getActiveField(duel);
export const selectInteraction = ({ duel }: RootState) => duel.interaction;
export const selectActiveTurn = ({ duel }: RootState) => duel.activeTurn;
export const selectConfig = ({ duel }: RootState) => duel.config;
export const selectIsCPU =
  (dKey: DKey) =>
  ({ duel }: RootState) =>
    isPlayer(dKey)
      ? duel.config.p1Type === PlayerType.CPU
      : duel.config.p2Type === PlayerType.CPU;
export const selectIsDuelOver = ({ duel }: RootState) => isDuelOver(duel);
export const selectShouldHighlightCursorZone = ({ duel }: RootState) => {
  // Determine if the ZoneSummaryBar should highlight the hovered card.
  // Note that this is NOT the same as if a card is rendered as faceup or facedown.
  const { cursorCoords } = duel.interaction;
  const [dKey] = cursorCoords;
  const z = getZone(duel, cursorCoords);
  return isOccupied(z) && (isFaceUp(z) || isPlayer(dKey));
};

export default duelSlice.reducer;

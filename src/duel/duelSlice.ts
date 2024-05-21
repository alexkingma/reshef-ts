import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { DKey, PlayerType, RowKey } from "./enums/duel";
import { duelReducers } from "./reducers/duelReducers";
import { duellistReducers } from "./reducers/duellistReducers";
import { interactionReducers } from "./reducers/interactionReducers";
import { zoneReducers } from "./reducers/zoneReducers";
import { getEmptyDuel, isDuelOver } from "./util/duelUtil";
import { getOtherDuellistKey, isPlayer } from "./util/duellistUtil";
import { getActiveField, getFieldCard } from "./util/fieldUtil";
import { getRow, hasMatchInRow } from "./util/rowUtil";
import { getZone, isFaceUp, isOccupied } from "./util/zoneUtil";

const initialState: Duel = getEmptyDuel();

export const duelSlice = createSlice({
  name: "duel",
  initialState,
  reducers: {
    ...zoneReducers,
    ...duellistReducers,
    ...interactionReducers,
    ...duelReducers,
  },
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

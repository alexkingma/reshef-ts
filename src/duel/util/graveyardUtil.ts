import { DKey, Orientation, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { CARD_NONE } from "./common";
import { getOtherDuellistKey } from "./duellistUtil";
import { setCardAtCoords, specialSummon } from "./zoneUtil";

export const clearGraveyard = (state: Duel, dKey: DKey) => {
  state.duellists[dKey].graveyard = [{ id: CARD_NONE }];
};

export const isGraveyardEmpty = (state: Duel, dKey: DKey) => {
  return state.duellists[dKey].graveyard[0].id === CARD_NONE;
};

export const getGraveyardCard = (state: Duel, dKey: DKey) => {
  return state.duellists[dKey].graveyard[0].id;
};

export const addToGraveyard = (state: Duel, dKey: DKey, id: Monster) => {
  setCardAtCoords(state, [dKey, RowKey.Graveyard, 0], id, {
    orientation: Orientation.FaceUp,
  });
};

export const graveyardContainsCards = (
  state: Duel,
  dKey: DKey,
  ...ids: Monster[]
) => {
  if (isGraveyardEmpty(state, dKey)) return false;
  return ids.some((c) => c === getGraveyardCard(state, dKey));
};

export const resurrectOwn = (state: Duel, dKey: DKey) => {
  if (isGraveyardEmpty(state, dKey)) return;

  specialSummon(state, dKey, getGraveyardCard(state, dKey));
  clearGraveyard(state, dKey);
};

export const resurrectEnemy = (state: Duel, originatorKey: DKey) => {
  const targetKey = getOtherDuellistKey(originatorKey);
  if (isGraveyardEmpty(state, targetKey)) return;

  specialSummon(state, originatorKey, getGraveyardCard(state, targetKey));
  clearGraveyard(state, targetKey);
};

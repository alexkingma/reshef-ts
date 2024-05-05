import { Orientation, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { getOtherDuellistKey } from "./duellistUtil";
import { setCardAtCoords, specialSummon } from "./zoneUtil";

export const clearGraveyard = (state: Duel, dKey: DuellistKey) => {
  state[dKey].graveyard = [{ isOccupied: false }];
};

export const isGraveyardEmpty = (state: Duel, dKey: DuellistKey) => {
  return !state[dKey].graveyard[0].isOccupied;
};

export const getGraveyardCard = (state: Duel, dKey: DuellistKey) => {
  const gy = state[dKey].graveyard[0] as OccupiedMonsterZone;
  return gy.card.id;
};

export const addToGraveyard = (state: Duel, dKey: DuellistKey, id: Monster) => {
  setCardAtCoords(state, [dKey, RowKey.Graveyard, 0], id, {
    orientation: Orientation.FaceUp,
  });
};

export const graveyardContainsCards = (
  state: Duel,
  dKey: DuellistKey,
  ...ids: Monster[]
) => {
  if (isGraveyardEmpty(state, dKey)) return false;
  return ids.some((c) => c === getGraveyardCard(state, dKey));
};

export const resurrectOwn = (state: Duel, dKey: DuellistKey) => {
  if (isGraveyardEmpty(state, dKey)) return;

  specialSummon(state, dKey, getGraveyardCard(state, dKey));
  clearGraveyard(state, dKey);
};

export const resurrectEnemy = (state: Duel, originatorKey: DuellistKey) => {
  const targetKey = getOtherDuellistKey(originatorKey);
  if (isGraveyardEmpty(state, targetKey)) return;

  specialSummon(state, originatorKey, getGraveyardCard(state, targetKey));
  clearGraveyard(state, targetKey);
};

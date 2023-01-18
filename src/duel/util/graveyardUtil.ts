import { Orientation } from "../common";
import { getCard } from "./cardUtil";
import { getOtherDuellistKey } from "./duellistUtil";
import { specialSummon } from "./zoneUtil";

export const clearGraveyard = (state: Duel, dKey: DuellistKey) => {
  state[dKey].graveyard = [];
};

export const isGraveyardEmpty = (state: Duel, dKey: DuellistKey) => {
  return !state[dKey].graveyard[0].isOccupied;
};

export const getGraveyardCard = (state: Duel, dKey: DuellistKey) => {
  const gy = state[dKey].graveyard[0] as OccupiedMonsterZone;
  return gy.card.name;
};

export const addToGraveyard = (
  state: Duel,
  dKey: DuellistKey,
  cardName: CardName
) => {
  state[dKey].graveyard[0] = {
    isOccupied: true,
    card: getCard(cardName),
    orientation: Orientation.FaceUp,
  };
};

export const graveyardContainsCards = (
  state: Duel,
  dKey: DuellistKey,
  ...cardNames: CardName[]
) => {
  if (isGraveyardEmpty(state, dKey)) return false;
  return cardNames.some((c) => c === getGraveyardCard(state, dKey));
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

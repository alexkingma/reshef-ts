import { getOtherDuellistKey } from "./duellistUtil";
import { specialSummon } from "./zoneUtil";

export const clearGraveyard = (state: Duel, dKey: DuellistKey) => {
  state[dKey].graveyard = null;
};

export const graveyardContainsCards = (
  state: Duel,
  dKey: DuellistKey,
  ...cardNames: CardName[]
) => {
  if (!state[dKey].graveyard) return false; // graveyard is empty
  return cardNames.some((c) => c === state[dKey].graveyard);
};

export const resurrectOwn = (state: Duel, dKey: DuellistKey) => {
  if (!state[dKey].graveyard) return;

  specialSummon(state, dKey, state[dKey].graveyard as CardName);
  clearGraveyard(state, dKey);
};

export const resurrectEnemy = (state: Duel, originatorKey: DuellistKey) => {
  const targetKey = getOtherDuellistKey(originatorKey);
  if (!state[targetKey].graveyard) return;

  specialSummon(state, originatorKey, state[targetKey].graveyard as CardName);
  clearGraveyard(state, targetKey);
};

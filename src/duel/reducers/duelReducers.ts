import { getRandomDuel } from "../util/duelUtil";

export const duelReducers = {
  setDuel: (state: Duel, newDuel: Duel) => {
    // TODO: remainingDuels shouldn't be a sub-property of an existing duel.
    // This is a cheap workaround to prevent it being overwritten
    // every time a new duel is instantiated as part of a simulation loop.
    newDuel.config.remainingDuels = state.config.remainingDuels;

    Object.entries(newDuel).forEach(([key, val]) => {
      state[key as keyof Duel] = val;
    });
  },
  randomiseDuel: (state: Duel) => {
    const randomGame = getRandomDuel();
    Object.entries(randomGame).forEach(([key, val]) => {
      state[key as keyof Duel] = val;
    });
  },
  decrementRemainingDuels: (state: Duel) => {
    state.config.remainingDuels--;
  },
};

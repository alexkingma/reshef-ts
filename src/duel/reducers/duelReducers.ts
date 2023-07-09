import { getRandomDuel } from "../util/duelUtil";

export const duelReducers = {
  setDuel: (state: Duel, newDuel: Duel) => {
    // TODO: these props aren't part of a duel and need to be moved.
    // This is a cheap workaround to prevent it being overwritten
    // every time a new duel is instantiated as part of a simulation loop.
    newDuel.config.showDuelUI = state.config.showDuelUI;
    newDuel.config.totalDuelsToPlay = state.config.totalDuelsToPlay;
    newDuel.config.computerDelayMs = state.config.computerDelayMs;

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
  updateConfig: (state: Duel, newConfig: Partial<DuelConfig>) => {
    state.config = { ...state.config, ...newConfig };
  },
};

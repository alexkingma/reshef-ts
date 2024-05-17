import { DuelType, PlayerType } from "../enums/duel";
import { getNewDuel } from "../util/duelUtil";
import { getRandomDuellable } from "../util/duellistUtil";

const setDuel = (state: Duel, newDuel: Duel) => {
  // TODO: config props aren't part of a duel and need to be moved.
  // This is a cheap workaround to prevent it being overwritten
  // every time a new duel is instantiated as part of a simulation loop.
  newDuel.config = { ...state.config };

  Object.entries(newDuel).forEach(([key, val]) => {
    state[key as keyof Duel] = val;
  });
};

export const duelReducers = {
  initDuel: (state: Duel) => {
    // start a new duel according to current config
    const { duelType, p1Name, p2Name } = state.config;
    if (duelType === DuelType.Exhibition) {
      // Exhibition mode hides most config fields fron the user;
      // Set exhibition defaults instead of relying on lingering simulation data.
      state.config = {
        ...state.config,
        p1Type: PlayerType.Human,
        p2Type: PlayerType.CPU,
        totalDuelsToPlay: 1,
        showDuelUI: true,
        cpuDelayMs: 800, // TODO: is this the most natural speed?
      };
    }

    setDuel(state, getNewDuel(p1Name, p2Name));
  },
  updateConfig: (state: Duel, newConfig: Partial<DuelConfig>) => {
    state.config = { ...state.config, ...newConfig };
  },
  randomiseDuellists: (state: Duel) => {
    const d1 = getRandomDuellable().name;
    let d2: DuellableName;
    do {
      // don't let a duellist play themselves, rating will never change
      d2 = getRandomDuellable().name;
    } while (d2 === d1);

    duelReducers.updateConfig(state, { p1Name: d1, p2Name: d2 });
    setDuel(state, getNewDuel(d1, d2));
  },
};

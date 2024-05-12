import { checkAutoEffects } from "../util/autoEffectUtil";
import { draw } from "../util/deckUtil";
import { getRandomDuel } from "../util/duelUtil";

export const duelReducers = {
  setDuel: (state: Duel, newDuel: Duel) => {
    // TODO: config props aren't part of a duel and need to be moved.
    // This is a cheap workaround to prevent it being overwritten
    // every time a new duel is instantiated as part of a simulation loop.
    newDuel.config = { ...state.config };

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
  startTurn: (state: Duel) => {
    // start-of-turn effects execute here
    checkAutoEffects(state);

    const { activeTurn } = state;
    activeTurn.isStartOfTurn = false;

    // displaying dialogue prompts and Draw Phase (in spirit)
    // takes place AFTER start-of-turn field checks
    draw(state, activeTurn.dKey);
  },
};

import { draw } from "./cardEffectUtil";
import { DuellistCoordsMap, StateMap } from "./duelSlice";
import { checkAutoEffects, shuffle } from "./duelUtil";

export const duellistReducers = {
  shuffle: ({ originatorState }: StateMap) => {
    shuffle(originatorState.deck);
  },
  endTurn: (
    { originatorState, activeTurn }: StateMap,
    { otherDKey }: DuellistCoordsMap
  ) => {
    // reset all turn-based params, then hand over to other player
    originatorState.monsterZones.forEach((zone) => {
      if (!zone.isOccupied) return;
      zone.isLocked = false;
    });
    activeTurn.duellistKey = otherDKey;
    activeTurn.isStartOfTurn = true;
    activeTurn.hasNormalSummoned = false;
    activeTurn.numTributedMonsters = 0;
  },
  startTurn: (stateMap: StateMap, { dKey }: DuellistCoordsMap) => {
    // start-of-turn effects execute here
    checkAutoEffects(stateMap);

    const { state, activeTurn } = stateMap;
    activeTurn.isStartOfTurn = false;

    // displaying dialogue prompts and Draw Phase (in spirit)
    // takes place AFTER start-of-turn field checks
    draw(state, dKey);
  },
};

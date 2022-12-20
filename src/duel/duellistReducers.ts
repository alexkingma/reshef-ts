import { draw } from "./cardEffectWrapped";
import { DuellistCoordsMap, StateMap } from "./duelSlice";
import { shuffle } from "./duelUtil";

export const duellistReducers = {
  shuffle: ({ originatorState }: StateMap) => {
    shuffle(originatorState.deck);
  },
  draw: draw(),
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
    activeTurn.hasNormalSummoned = false;
    activeTurn.numTributedMonsters = 0;
  },
};

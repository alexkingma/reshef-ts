import { draw } from "./cardEffectUtil";
import { BattlePosition, Orientation } from "./common";
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
    originatorState.monsterZones.forEach((z) => {
      if (!z.isOccupied) return;
      if (z.battlePosition === BattlePosition.Attack) {
        z.orientation = Orientation.FaceUp;
      }
      z.isLocked = false;
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

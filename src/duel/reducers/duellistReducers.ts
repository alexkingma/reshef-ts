import { BattlePosition, Orientation } from "../common";
import { DuellistCoordsMap } from "../duelSlice";
import { draw } from "../util/cardEffectUtil";
import { checkAutoEffects, getRow, shuffle } from "../util/duelUtil";

export const duellistReducers = {
  shuffle: (state: Duel, { dKey }: DuellistCoordsMap) => {
    shuffle(state[dKey].deck);
  },
  endTurn: (state: Duel, { ownMonsters, otherDKey }: DuellistCoordsMap) => {
    // reset all turn-based params, then hand over to other player
    const monsterZones = getRow(state, ownMonsters) as MonsterZone[];
    monsterZones.forEach((z) => {
      if (!z.isOccupied) return;
      if (z.battlePosition === BattlePosition.Attack) {
        z.orientation = Orientation.FaceUp;
      }
      z.isLocked = false;
    });
    state.activeTurn = {
      ...state.activeTurn,
      duellistKey: otherDKey,
      isStartOfTurn: true,
      hasNormalSummoned: false,
      numTributedMonsters: 0,
    };
  },
  startTurn: (state: Duel, { dKey }: DuellistCoordsMap) => {
    // start-of-turn effects execute here
    checkAutoEffects(state);

    const { activeTurn } = state;
    activeTurn.isStartOfTurn = false;

    // displaying dialogue prompts and Draw Phase (in spirit)
    // takes place AFTER start-of-turn field checks
    draw(state, dKey);
  },
};

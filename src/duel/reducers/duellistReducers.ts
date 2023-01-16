import { BattlePosition, Orientation } from "../common";
import { checkAutoEffects } from "../util/autoEffectUtil";
import { shuffle } from "../util/common";
import { draw, getTempCardQuantMap } from "../util/deckUtil";
import { getActiveEffects } from "../util/duellistUtil";
import { getInitialDuel } from "../util/duelUtil";
import { getRow } from "../util/rowUtil";
import { clearZone, getZone, specialSummon } from "../util/zoneUtil";

export const duellistReducers = {
  shuffle: (state: Duel, { dKey }: DuellistCoordsMap) => {
    shuffle(state[dKey].deck);
  },
  randomiseDuel: (state: Duel) => {
    const randomGame = getInitialDuel(
      getTempCardQuantMap(),
      getTempCardQuantMap()
    );
    Object.entries(randomGame).forEach(([key, val]) => {
      state[key as keyof Duel] = val;
    });
  },
  endTurn: (
    state: Duel,
    { ownMonsters, dKey, otherDKey }: DuellistCoordsMap
  ) => {
    // restore ownership of any monsters affected by Brain Control
    const ownActiveEffects = getActiveEffects(state, dKey);
    const opponentActiveEffects = getActiveEffects(state, otherDKey);
    ownActiveEffects.brainControlZones.forEach((zoneCoords) => {
      const { card, permPowerUpLevel } = getZone(
        state,
        zoneCoords
      ) as OccupiedMonsterZone;
      specialSummon(state, otherDKey, card.name, { permPowerUpLevel });
      clearZone(state, zoneCoords);
    });
    ownActiveEffects.brainControlZones = [];

    // decrement turns remaining for SoRL
    // Note that we check the originator/opponent's effect flag
    if (opponentActiveEffects.sorlTurnsRemaining > 0) {
      opponentActiveEffects.sorlTurnsRemaining--;
    }

    // unlock all monster zones
    const monsterZones = getRow(state, ownMonsters) as MonsterZone[];
    monsterZones.forEach((z) => {
      if (!z.isOccupied) return;
      if (z.battlePosition === BattlePosition.Attack) {
        z.orientation = Orientation.FaceUp;
      }
      z.isLocked = false;
    });

    // reset all turn-based params
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

import { BattlePosition, Orientation, RowKey } from "../common";
import { getMonsterIdxsByTributeable } from "../util/aiUtil";
import { checkAutoEffects } from "../util/autoEffectUtil";
import { getNumTributesRequired } from "../util/cardUtil";
import { shuffle } from "../util/common";
import { draw } from "../util/deckUtil";
import { getActiveEffects } from "../util/duellistUtil";
import { getRandomDuel } from "../util/duelUtil";
import { getRow, hasEmptyZone } from "../util/rowUtil";
import {
  clearZone,
  destroyAtCoords,
  getZone,
  specialSummon,
} from "../util/zoneUtil";

export const duellistReducers = {
  shuffle: (state: Duel, { dKey }: DuellistCoordsMap) => {
    shuffle(state[dKey].deck);
  },
  randomiseDuel: (state: Duel) => {
    const randomGame = getRandomDuel();
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
  aiNormalSummon: (state: Duel, { dKey, ownMonsters }: DuellistCoordsMap) => {
    // originCoords refers to the mon in hand to summon to the field.
    // Which tributes should be used need to be calced first,
    // and then saccing/summoning takes place all in one discrete step.
    // This cuts out unnecessary re-renders/setTimeouts in UI.
    const { activeTurn, interaction } = state;
    activeTurn.hasNormalSummoned = true;
    const { originCoords } = interaction;
    const originZone = getZone(state, originCoords!) as OccupiedMonsterZone;
    const numTributesRequired = getNumTributesRequired(originZone.card);

    // these idxs hold mons that are weaker than the intended summon
    const weakerIdxs = getMonsterIdxsByTributeable(
      state,
      dKey,
      originZone.card.effAtk
    );

    if (
      !weakerIdxs.length &&
      (numTributesRequired || !hasEmptyZone(state, ownMonsters))
    ) {
      // All field monsters are stronger than the chosen hand monster,
      // preventing them from being tributed or overwritten by a tribute-less mon
      return;
    }

    if (numTributesRequired) {
      const idxsToTribute = weakerIdxs.slice(0, numTributesRequired);
      if (!idxsToTribute.length) {
        console.log(
          `No tributeable monsters found, but tributes are necessary!`
        );
        return;
      }

      // tribute as many monsters as is necessary to bring out the chosen mon
      idxsToTribute.forEach((i) => {
        destroyAtCoords(state, [...ownMonsters, i]);
        state.activeTurn.numTributedMonsters++;
      });
    }

    if (!hasEmptyZone(state, ownMonsters)) {
      // no space to summon at, clear the weakest mon to make space
      clearZone(state, [dKey, RowKey.Monster, weakerIdxs[0]]);
    }

    // summon monster to field
    specialSummon(state, dKey, originZone.card.name, {
      orientation: Orientation.FaceDown,
    });

    // remove summoned mon from hand
    clearZone(state, originCoords!);
  },
};

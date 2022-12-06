import { clearZone, destroyAtCoords } from "./cardEffectUtil";
import { draw } from "./cardEffectWrapped";
import { attackMonster } from "./combatUtil";
import { BattlePosition, FieldRow, Orientation, Spell } from "./common";
import { ReducerArg } from "./duelSlice";
import {
  generateOccupiedMonsterZone,
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
  getOtherDuellistKey,
  shuffle,
} from "./duelUtil";
import { spellEffectReducers } from "./spellEffectReducers";

export const coreDuelReducers = {
  shuffle: ({ originatorState }: ReducerArg) => {
    originatorState.deck = shuffle(originatorState.deck);
  },
  draw: draw(),
  normalSummon: (
    { originatorState, activeTurn }: ReducerArg,
    handIdx: FieldCol
  ) => {
    // remove monster from hand at given index, summon it to the field
    const zoneIdx = getFirstEmptyZoneIdx(originatorState.monsterZones, true);
    const { card } = originatorState.hand[handIdx] as OccupiedMonsterZone;
    clearZone(originatorState.hand, handIdx);
    originatorState.monsterZones[zoneIdx] = {
      ...generateOccupiedMonsterZone(card),
      orientation: Orientation.FaceDown,
    };
    activeTurn.hasNormalSummoned = true;
  },
  setSpellTrap: ({ originatorState }: ReducerArg, handIdx: FieldCol) => {
    // remove spell/trap from hand at given index, set it on the field
    const zoneIdx = getFirstEmptyZoneIdx(originatorState.spellTrapZones, true);
    const { card } = originatorState.hand[handIdx] as OccupiedSpellTrapZone;
    clearZone(originatorState.hand, handIdx);
    originatorState.spellTrapZones[zoneIdx] = {
      isOccupied: true,
      card,
      orientation: Orientation.FaceDown,
    };
  },
  attackMonster: (
    { originatorState, targetState }: ReducerArg,
    attackerIdx: FieldCol
  ) => {
    const attackerZone = originatorState.monsterZones[
      attackerIdx
    ] as OccupiedMonsterZone;
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) {
      // no monsters, attack directly
      targetState.lp -= attackerZone.card.atk;
    } else {
      const targetZone = targetState.monsterZones[
        targetIdx
      ] as OccupiedMonsterZone;
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(attackerZone, targetZone);
      if (attackerDestroyed) {
        destroyAtCoords(originatorState, [FieldRow.PlayerMonster, attackerIdx]);
      }
      if (targetDestroyed) {
        destroyAtCoords(targetState, [FieldRow.OpponentMonster, targetIdx]);
      }
      if (attackerLpLoss) {
        originatorState.lp -= attackerLpLoss;
      }
      if (targetLpLoss) {
        targetState.lp -= targetLpLoss;
      }
    }
    attackerZone.hasAttacked = true;
  },
  changeBattlePosition: (
    { originatorState }: ReducerArg,
    monsterIdx: FieldCol
  ) => {
    const zone = originatorState.monsterZones[
      monsterIdx
    ] as OccupiedMonsterZone;
    zone.battlePosition =
      zone.battlePosition === BattlePosition.Attack
        ? BattlePosition.Defence
        : BattlePosition.Attack;
  },
  endTurn: ({ originatorState, activeTurn }: ReducerArg) => {
    // reset all turn-based params, then hand over to other player
    originatorState.monsterZones.forEach((zone) => {
      if (!zone.isOccupied) return;
      zone.hasAttacked = false;
    });
    activeTurn.duellistKey = getOtherDuellistKey(activeTurn.duellistKey);
    activeTurn.hasNormalSummoned = false;
    activeTurn.numTributedMonsters = 0;
  },
  tribute: (
    { originatorState, activeTurn }: ReducerArg,
    monsterIdx: FieldCol
  ) => {
    destroyAtCoords(originatorState, [FieldRow.PlayerMonster, monsterIdx]);
    activeTurn.numTributedMonsters++;
  },
  discard: ({ originatorState }: ReducerArg, coords: FieldCoords) => {
    destroyAtCoords(originatorState, coords);
  },
  activateSpellEffect: (arg: ReducerArg, spellIdx: FieldCol) => {
    const { originatorState } = arg;

    const { card } = originatorState.spellTrapZones[
      spellIdx
    ] as OccupiedSpellTrapZone;
    const spellDispatch = spellEffectReducers[card.name as Spell];
    if (!spellDispatch) {
      console.log(`Spell effect not implemented for card: ${card.name}`);
      return;
    }
    spellDispatch(arg);

    // discard after activation
    clearZone(originatorState.spellTrapZones, spellIdx);
  },
};

import {
  attackMonster,
  clearZone,
  destroyAtCoords,
  directAttack,
} from "./cardEffectUtil";
import { draw } from "./cardEffectWrapped";
import { getCombatStats } from "./combatUtil";
import {
  AutoEffectMonster,
  BattlePosition,
  ManualEffectMonster,
  Orientation,
  RowKey,
  Spell,
} from "./common";
import { ReducerArg } from "./duelSlice";
import {
  generateOccupiedMonsterZone,
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
  getOtherDuellistKey,
  shuffle,
} from "./duelUtil";
import { monsterAutoEffectReducers } from "./monsterAutoEffectReducers";
import { monsterEffectReducers as monsterManualEffectReducers } from "./monsterManualEffectReducers";
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
      ...generateOccupiedMonsterZone(card.name),
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
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) {
      // no monsters, attack directly
      directAttack(originatorState, targetState, attackerIdx);
    } else {
      attackMonster(originatorState, targetState, attackerIdx, targetIdx);
    }
    (
      originatorState.monsterZones[attackerIdx] as OccupiedMonsterZone
    ).isLocked = true;
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
      zone.isLocked = false;
    });
    activeTurn.duellistKey = getOtherDuellistKey(activeTurn.duellistKey);
    activeTurn.hasNormalSummoned = false;
    activeTurn.numTributedMonsters = 0;
  },
  tribute: (
    { originatorState, activeTurn }: ReducerArg,
    monsterIdx: FieldCol
  ) => {
    destroyAtCoords(originatorState, [RowKey.Monster, monsterIdx]);
    activeTurn.numTributedMonsters++;
  },
  discard: ({ originatorState }: ReducerArg, coords: ZoneCoordsForDuellist) => {
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
  activateManualMonsterEffect: (arg: ReducerArg, monsterIdx: FieldCol) => {
    const { originatorState } = arg;

    const { card } = originatorState.monsterZones[
      monsterIdx
    ] as OccupiedMonsterZone;
    const monsterManualEffectDispatch =
      monsterManualEffectReducers[card.name as ManualEffectMonster];
    const monsterAutoEffectDispatch =
      monsterAutoEffectReducers[card.name as AutoEffectMonster];

    if (!monsterManualEffectDispatch && !monsterAutoEffectDispatch) {
      console.log(`Monster effect not implemented for card: ${card.name}`);
      return;
    }

    if (monsterManualEffectDispatch) {
      monsterManualEffectDispatch(arg, monsterIdx);
    }

    // DEBUG ONLY
    if (monsterAutoEffectDispatch) {
      monsterAutoEffectDispatch(arg, monsterIdx);
    }

    // lock card once effect is complete
    const zonePostEffect = originatorState.monsterZones[monsterIdx];
    if (zonePostEffect.isOccupied && zonePostEffect.card.name === card.name) {
      // only lock card if the monster is the same one as before the effect
      // cards that destroy themselves or summon other monsters
      // ... in their idx usually do not need to be locked, and should
      // ... be addressed case-by -case in individual reducers
      zonePostEffect.isLocked = true;
    }
  },
  updateField: (arg: ReducerArg) => {
    const { originatorState, activeField } = arg;

    originatorState.monsterZones.forEach((z, i, zones) => {
      if (!z.isOccupied) return;
      // TODO: reset each zone's temp power-up level and (in a separate method?) re-calculate
      (zones[i] as OccupiedMonsterZone).card = {
        ...z.card,
        ...getCombatStats(z, activeField),
      };
    });
  },
};

import { default as alignmentMap } from "../assets/alignment.json";
import { default as fieldMultiplierMap } from "../assets/fields.json";
import { BattlePosition, Field, RowKey, TempAutoEffectMonster } from "./common";
import { StateMap, ZoneCoordsMap } from "./duelSlice";
import {
  activateTempEffect,
  getOtherDuellistKey,
  getZone,
  getZoneCoordsMap,
} from "./duelUtil";
import { monsterTempAutoEffectReducers } from "./monsterTempAutoEffectReducers";

export const calculateAttack = (
  attacker: OccupiedMonsterZone,
  target: OccupiedMonsterZone
) => {
  const isDefending = target.battlePosition === BattlePosition.Defence;
  const diff =
    attacker.card.effAtk -
    (isDefending ? target.card.effDef : target.card.effAtk);
  const { isWeak, isStrong } = getAlignmentResult(
    attacker.card.alignment,
    target.card.alignment
  );

  const attackerDestroyed =
    !isStrong && (isWeak || (diff <= 0 && !isDefending));
  const targetDestroyed =
    !isWeak && (isStrong || diff > 0 || (diff === 0 && !isDefending));
  const attackerLpLoss = targetDestroyed || diff >= 0 ? 0 : Math.abs(diff);
  const targetLpLoss = attackerDestroyed || diff <= 0 || isDefending ? 0 : diff;

  return {
    attackerDestroyed,
    targetDestroyed,
    attackerLpLoss,
    targetLpLoss,
  };
};

export const getCombatStats = (zone: OccupiedMonsterZone, field: Field) => {
  const { card, permPowerUpLevel: perm, tempPowerUpLevel: temp } = zone;
  const fieldMultiplier = getFieldMultiplier(field, card.type);
  const { atk: baseAtk, def: baseDef } = zone.card;
  const calc = (base: number) =>
    Math.max(0, base * fieldMultiplier + (perm + temp) * 500);
  return {
    effAtk: calc(baseAtk),
    effDef: calc(baseDef),
  };
};

const getAlignmentResult = (attacker: Alignment, target: Alignment) => {
  const { strong, weak } = alignmentMap[attacker];
  return { isStrong: strong === target, isWeak: weak === target };
};

const getFieldMultiplier = (field: Field, type: CardType) => {
  const map = fieldMultiplierMap[field] as { [key in CardType]: number };
  return map[type] || 1;
};

export const recalcCombatStats = (stateMap: StateMap) => {
  resetCombatStats(stateMap);
  activateTempAutoEffects(stateMap);
  calcCombatStats(stateMap);
};

const resetCombatStats = ({
  originatorState,
  targetState,
  state,
}: StateMap) => {
  originatorState.monsterZones.forEach((z, i, zones) => {
    if (!z.isOccupied) return;
    resetZoneCombatStats(zones[i] as OccupiedMonsterZone, state.activeField);
  });
  targetState.monsterZones.forEach((z, i, zones) => {
    if (!z.isOccupied) return;
    resetZoneCombatStats(zones[i] as OccupiedMonsterZone, state.activeField);
  });
};

const calcCombatStats = ({ originatorState, targetState, state }: StateMap) => {
  originatorState.monsterZones.forEach((z, i, zones) => {
    if (!z.isOccupied) return;
    calcZoneCombatStats(zones[i] as OccupiedMonsterZone, state.activeField);
  });
  targetState.monsterZones.forEach((z, i, zones) => {
    if (!z.isOccupied) return;
    calcZoneCombatStats(zones[i] as OccupiedMonsterZone, state.activeField);
  });
};

const resetZoneCombatStats = (zone: OccupiedMonsterZone, field: Field) => {
  zone.tempPowerUpLevel = 0;
  calcZoneCombatStats(zone, field);
};

const calcZoneCombatStats = (zone: OccupiedMonsterZone, field: Field) => {
  zone.card = {
    ...zone.card,
    ...getCombatStats(zone, field),
  };
};

const activateTempAutoEffects = (stateMap: StateMap) => {
  const { originatorState, targetState, activeTurn } = stateMap;
  const { duellistKey: activeKey } = activeTurn;
  const inactiveKey = getOtherDuellistKey(activeKey);
  originatorState.monsterZones.forEach((z, i) => {
    if (!z.isOccupied) return;
    activateZoneTempAutoEffects(
      stateMap,
      getZoneCoordsMap([activeKey, RowKey.Monster, i as FieldCol])
    );
  });
  targetState.monsterZones.forEach((z, i) => {
    if (!z.isOccupied) return;
    activateZoneTempAutoEffects(
      stateMap,
      getZoneCoordsMap([inactiveKey, RowKey.Monster, i as FieldCol])
    );
  });
};

const activateZoneTempAutoEffects = (
  stateMap: StateMap,
  coordsMap: ZoneCoordsMap
) => {
  const { state } = stateMap;
  const { zoneCoords } = coordsMap;
  const { card } = getZone(state, zoneCoords) as OccupiedMonsterZone;
  const reducer =
    monsterTempAutoEffectReducers[card.name as TempAutoEffectMonster];
  if (!reducer) return;

  activateTempEffect(stateMap, coordsMap, reducer);
};

import { default as alignmentMap } from "../assets/alignment.json";
import { default as fieldMultiplierMap } from "../assets/fields.json";
import { BattlePosition, Field, RowKey, TempPowerUpMonster } from "./common";
import { ZoneCoordsMap } from "./duelSlice";
import {
  activateTempEffect,
  getOtherDuellistKey,
  getZone,
  getZoneCoordsMap,
} from "./duelUtil";
import { monsterTempPowerUpReducers } from "./monsterTempPowerUpReducers";

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

export const recalcCombatStats = (state: Duel) => {
  resetCombatStats(state);
  activateTempPowerUps(state);
  calcCombatStats(state);
};

const resetCombatStats = (state: Duel) => {
  const dKey = state.activeTurn.duellistKey;
  const originatorState = state[dKey];
  const targetState = state[getOtherDuellistKey(dKey)];
  originatorState.monsterZones.forEach((z, i, zones) => {
    if (!z.isOccupied) return;
    resetZoneCombatStats(zones[i] as OccupiedMonsterZone, state.activeField);
  });
  targetState.monsterZones.forEach((z, i, zones) => {
    if (!z.isOccupied) return;
    resetZoneCombatStats(zones[i] as OccupiedMonsterZone, state.activeField);
  });
};

const calcCombatStats = (state: Duel) => {
  const dKey = state.activeTurn.duellistKey;
  const originatorState = state[dKey];
  const targetState = state[getOtherDuellistKey(dKey)];
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

const activateTempPowerUps = (state: Duel) => {
  const dKey = state.activeTurn.duellistKey;
  const originatorState = state[dKey];
  const targetState = state[getOtherDuellistKey(dKey)];
  const { duellistKey: activeKey } = state.activeTurn;
  const inactiveKey = getOtherDuellistKey(activeKey);
  originatorState.monsterZones.forEach((z, i) => {
    if (!z.isOccupied) return;
    activateZoneTempPowerUps(
      state,
      getZoneCoordsMap([activeKey, RowKey.Monster, i as FieldCol])
    );
  });
  targetState.monsterZones.forEach((z, i) => {
    if (!z.isOccupied) return;
    activateZoneTempPowerUps(
      state,
      getZoneCoordsMap([inactiveKey, RowKey.Monster, i as FieldCol])
    );
  });
};

const activateZoneTempPowerUps = (state: Duel, coordsMap: ZoneCoordsMap) => {
  const { zoneCoords } = coordsMap;
  const { card } = getZone(state, zoneCoords) as OccupiedMonsterZone;
  const reducer = monsterTempPowerUpReducers[card.name as TempPowerUpMonster];
  if (!reducer) return;

  activateTempEffect(state, coordsMap, reducer);
};

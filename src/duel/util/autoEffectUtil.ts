import {
  Field,
  GraveyardEffectMonster,
  Orientation,
  PermAutoEffectMonster,
  RowKey,
  TempPowerUpMonster,
} from "../common";
import { ZoneCoordsMap } from "../duelSlice";
import { monsterGraveyardEffectReducers } from "../reducers/monsterGraveyardEffectReducers";
import { monsterHandEffectReducers } from "../reducers/monsterHandEffectReducers";
import { monsterPermAutoEffectReducers } from "../reducers/monsterPermAutoEffectReducers";
import {
  MonsterAutoEffectReducer,
  monsterTempPowerUpReducers,
} from "../reducers/monsterTempPowerUpReducers";
import { getDuellistCoordsMap, getOtherDuellistKey } from "./duellistUtil";
import {
  getCombatStats,
  getZone,
  getZoneCoordsMap,
  isSpecificMonster,
} from "./zoneUtil";

export const checkAutoEffects = (state: Duel) => {
  // Temp power-up effect cards are separate from
  // permanent (but still auto) effect cards.
  // Temp power-ups must be calculated so that the permanent
  // effects may accurately deduce the "strongest" card, etc.
  // Then, once permanent effects (destruction, spec. summoning, etc.)
  // are complete, temp power-ups should be recalculated one final time.
  recalcCombatStats(state);
  checkPermAutoEffects(state);
  recalcCombatStats(state);
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

export const activateTempEffect = (
  state: Duel,
  coordsMap: ZoneCoordsMap,
  reducer: MonsterAutoEffectReducer
) => {
  const { zoneCoords } = coordsMap;
  const originalZone = getZone(state, zoneCoords) as OccupiedMonsterZone;
  const originalCardName = originalZone.card.name;

  const conEffectPairs = reducer(state, coordsMap);
  conEffectPairs.forEach(({ condition, effect }) => {
    if (condition()) {
      effect(state, coordsMap);

      // See postDirectMonsterAction() for context on this check.
      // Auto effects are slightly different since they don't lock
      // or change battle position, but the reasoning is the same.
      if (isSpecificMonster(originalZone, originalCardName)) {
        originalZone.orientation = Orientation.FaceUp;
      }
    }
  });
};

export const checkPermAutoEffects = (state: Duel) => {
  const { activeTurn } = state;

  const dKey = activeTurn.duellistKey;
  const otherDKey = getOtherDuellistKey(dKey);
  const originatorState = state[dKey];
  const targetState = state[otherDKey];

  checkGraveyardEffect(state, dKey);
  checkGraveyardEffect(state, otherDKey);

  originatorState.monsterZones.forEach((_, i) => {
    checkMonsterAutoEffect(
      state,
      getZoneCoordsMap([dKey, RowKey.Monster, i as FieldCol]),
      monsterPermAutoEffectReducers
    );
  });

  targetState.monsterZones.forEach((_, i) => {
    checkMonsterAutoEffect(
      state,
      getZoneCoordsMap([otherDKey, RowKey.Monster, i as FieldCol]),
      monsterPermAutoEffectReducers
    );
  });

  // TODO: spell/trap zones (DCJ, MoP, ... are there more?)

  originatorState.hand.forEach((_, i) => {
    checkMonsterAutoEffect(
      state,
      getZoneCoordsMap([dKey, RowKey.Hand, i as FieldCol]),
      monsterHandEffectReducers
    );
  });

  targetState.hand.forEach((_, i) => {
    checkMonsterAutoEffect(
      state,
      getZoneCoordsMap([otherDKey, RowKey.Hand, i as FieldCol]),
      monsterHandEffectReducers
    );
  });
};

export const checkGraveyardEffect = (state: Duel, dKey: DuellistKey) => {
  const { graveyard } = state[dKey];
  if (!graveyard) return;
  const reducer =
    monsterGraveyardEffectReducers[graveyard as GraveyardEffectMonster];
  if (!reducer) return;

  const conEffectPairs = reducer(state, getDuellistCoordsMap(dKey));
  conEffectPairs.forEach(({ condition, effect }) => {
    if (condition()) {
      effect(state, getDuellistCoordsMap(dKey));
    }
  });
};

export const checkMonsterAutoEffect = (
  state: Duel,
  coordsMap: ZoneCoordsMap,
  reducerMap: {
    [cardName in CardName]?: any;
  }
) => {
  const { zoneCoords } = coordsMap;
  const zone = getZone(state, zoneCoords);
  if (!zone.isOccupied) return;
  const reducer = reducerMap[zone.card.name as PermAutoEffectMonster];
  if (!reducer) return;

  activateTempEffect(state, coordsMap, reducer);
};

import {
  Field,
  GraveyardEffectMonster,
  Orientation,
  RowKey,
  TempPowerUpMonster,
} from "../common";
import { monsterGraveyardEffectReducers } from "../reducers/monsterGraveyardEffectReducers";
import { monsterHandEffectReducers } from "../reducers/monsterHandEffectReducers";
import { monsterPermAutoEffectReducers } from "../reducers/monsterPermAutoEffectReducers";
import { monsterTempPowerUpReducers } from "../reducers/monsterTempPowerUpReducers";
import { perpetualSpellTrapReducers } from "../reducers/perpetualSpellTrapReducers";
import { getDuellistCoordsMap, getOtherDuellistKey } from "./duellistUtil";
import { getActiveField } from "./fieldUtil";
import { getGraveyardCard, isGraveyardEmpty } from "./graveyardUtil";
import { getCombatStats, getZone, getZoneCoordsMap } from "./zoneUtil";

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
    resetZoneCombatStats(
      zones[i] as OccupiedMonsterZone,
      getActiveField(state)
    );
  });
  targetState.monsterZones.forEach((z, i, zones) => {
    if (!z.isOccupied) return;
    resetZoneCombatStats(
      zones[i] as OccupiedMonsterZone,
      getActiveField(state)
    );
  });
};

const calcCombatStats = (state: Duel) => {
  const dKey = state.activeTurn.duellistKey;
  const originatorState = state[dKey];
  const targetState = state[getOtherDuellistKey(dKey)];
  originatorState.monsterZones.forEach((z, i, zones) => {
    if (!z.isOccupied) return;
    calcZoneCombatStats(zones[i] as OccupiedMonsterZone, getActiveField(state));
  });
  targetState.monsterZones.forEach((z, i, zones) => {
    if (!z.isOccupied) return;
    calcZoneCombatStats(zones[i] as OccupiedMonsterZone, getActiveField(state));
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
      getZoneCoordsMap([activeKey, RowKey.Monster, i])
    );
  });
  targetState.monsterZones.forEach((z, i) => {
    if (!z.isOccupied) return;
    activateZoneTempPowerUps(
      state,
      getZoneCoordsMap([inactiveKey, RowKey.Monster, i])
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
  reducer: MultiEffConReducer
) => {
  const { zoneCoords } = coordsMap;
  const zone = getZone(state, zoneCoords) as OccupiedZone;

  const conEffectPairs = reducer(state, coordsMap);
  conEffectPairs.forEach(({ condition, effect }) => {
    if (condition()) {
      zone.orientation = Orientation.FaceUp;
      effect(state, coordsMap);
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

  // monster effects
  originatorState.monsterZones.forEach((_, i) => {
    checkAutoEffect(
      state,
      getZoneCoordsMap([dKey, RowKey.Monster, i]),
      monsterPermAutoEffectReducers
    );
  });
  targetState.monsterZones.forEach((_, i) => {
    checkAutoEffect(
      state,
      getZoneCoordsMap([otherDKey, RowKey.Monster, i]),
      monsterPermAutoEffectReducers
    );
  });

  // spell/trap effects
  originatorState.spellTrapZones.forEach((_, i) => {
    checkAutoEffect(
      state,
      getZoneCoordsMap([dKey, RowKey.SpellTrap, i]),
      perpetualSpellTrapReducers
    );
  });
  targetState.spellTrapZones.forEach((_, i) => {
    checkAutoEffect(
      state,
      getZoneCoordsMap([otherDKey, RowKey.SpellTrap, i]),
      perpetualSpellTrapReducers
    );
  });

  // hand effects
  originatorState.hand.forEach((_, i) => {
    checkAutoEffect(
      state,
      getZoneCoordsMap([dKey, RowKey.Hand, i]),
      monsterHandEffectReducers
    );
  });
  targetState.hand.forEach((_, i) => {
    checkAutoEffect(
      state,
      getZoneCoordsMap([otherDKey, RowKey.Hand, i]),
      monsterHandEffectReducers
    );
  });
};

export const checkGraveyardEffect = (state: Duel, dKey: DuellistKey) => {
  if (isGraveyardEmpty(state, dKey)) return;
  const gyCard = getGraveyardCard(state, dKey);
  const reducer =
    monsterGraveyardEffectReducers[gyCard as GraveyardEffectMonster];
  if (!reducer) return;

  const conEffectPairs = reducer(state, getDuellistCoordsMap(dKey));
  conEffectPairs.forEach(({ condition, effect }) => {
    if (condition()) {
      effect(state, getDuellistCoordsMap(dKey));
    }
  });
};

export const checkAutoEffect = <T extends CardName>(
  state: Duel,
  coordsMap: ZoneCoordsMap,
  reducerMap: CardReducerMap<T, MultiEffConReducer>
) => {
  const { zoneCoords } = coordsMap;
  const zone = getZone(state, zoneCoords);
  if (!zone.isOccupied) return;
  const reducer = reducerMap[zone.card.name as T];
  if (!reducer) return;

  activateTempEffect(state, coordsMap, reducer);
};

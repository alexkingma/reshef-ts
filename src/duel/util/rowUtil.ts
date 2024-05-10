import { Orientation, RowKey } from "../enums/duel";
import { logEffectMessage } from "../util/logUtil";
import { getCard, getExodiaCards, getFinalCards } from "./cardUtil";
import { always } from "./common";
import {
  clearZone,
  destroyAtCoords,
  immobiliseZone,
  isMonster,
  isOccupied,
  isTrap,
  permPowerUp,
} from "./zoneUtil";

export const getRow = (state: Duel, [dKey, rKey]: RowCoords) => {
  return state[dKey][rKey];
};

export const hasFullExodia = (state: Duel, rowCoords: RowCoords) => {
  return rowContainsAllCards(state, rowCoords, ...getExodiaCards());
};

export const hasFullFINAL = (state: Duel, rowCoords: RowCoords) => {
  return rowContainsAllCards(state, rowCoords, ...getFinalCards());
};

export const getFirstEmptyZoneIdx = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  defaultToFirst: boolean = false
) => {
  const row = state[dKey][rKey];
  const nextFreeZoneIdx = row.findIndex((z) => !isOccupied(z));
  if (nextFreeZoneIdx !== -1) return nextFreeZoneIdx;
  if (defaultToFirst) {
    // no free zones, return the default index
    return 0;
  } else {
    // sometimes we want to know that no zones are available, but not return a default
    throw new Error(
      "No free zones found, catch this error to implement custom logic."
    );
  }
};

export const hasEmptyZone = (state: Duel, rowCoords: RowCoords) => {
  try {
    getFirstEmptyZoneIdx(state, rowCoords);
    return true;
  } catch (e) {
    // no free space to summon
    return false;
  }
};

export const getFirstOccupiedZoneIdx = (
  state: Duel,
  rowCoords: RowCoords,
  condition: (z: OccupiedZone) => boolean = () => true
) => {
  const row = getRow(state, rowCoords);
  return row.findIndex((z) => isOccupied(z) && condition(z));
};

export const getHighestAtkZoneIdx = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  condition: (z: OccupiedZone, i: number) => boolean = () => true
) => {
  let idx = -1;
  let highestAtk = -1;
  state[dKey][rKey].forEach((z, i) => {
    if (!isMonster(z) || !condition(z, i)) return;
    if (z.effAtk > highestAtk) {
      highestAtk = z.effAtk;
      idx = i;
    }
  });
  return idx;
};

export const getLowestAtkZoneIdx = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  condition: (z: OccupiedZone, i: number) => boolean = () => true
) => {
  let idx = -1;
  let lowestAtk = Number.MAX_SAFE_INTEGER;
  state[dKey][rKey].forEach((z, i) => {
    if (!isMonster(z) || !condition(z, i)) return;
    if (z.effAtk < lowestAtk) {
      lowestAtk = z.effAtk;
      idx = i;
    }
  });
  return idx;
};

export const getFirstSpecficCardIdx = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  id: CardId
) => {
  const row = state[dKey][rKey];
  return row.findIndex((z) => z.id === id);
};

export const rowContainsAnyCards = (
  state: Duel,
  rowCoords: RowCoords,
  ...ids: CardId[]
) => {
  return ids.some((id) => hasMatchInRow(state, rowCoords, (z) => z.id === id));
};

export const rowContainsAllCards = (
  state: Duel,
  rowCoords: RowCoords,
  ...ids: CardId[]
) => {
  // all provided cards must be present in the given row
  // alternatively: none of the provided cards may NOT be present
  return ids.every((c) => rowContainsAnyCards(state, rowCoords, c));
};

export const hasMatchInRow = (
  state: Duel,
  rowCoords: RowCoords,
  condition: (z: OccupiedZone, i: number) => boolean = () => true
) => {
  return countMatchesInRow(state, rowCoords, condition) > 0;
};

export const countMatchesInRow = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  condition: (z: OccupiedZone, i: number) => boolean = () => true
) => {
  const row = state[dKey][rKey];
  return row.filter((z, i) => isOccupied(z) && condition(z, i)).length;
};

export const destroyRow = (state: Duel, rowCoords: RowCoords) => {
  updateMatches(state, rowCoords, (_, idx) => {
    destroyAtCoords(state, [...rowCoords, idx]);
  });
};

const setRowOrientation = (
  state: Duel,
  rowCoords: RowCoords,
  orientation: Orientation
) => {
  updateMatches(state, rowCoords, (z) => {
    z.orientation = orientation;
  });
};

export const setRowFaceUp = (state: Duel, rowCoords: RowCoords) => {
  setRowOrientation(state, rowCoords, Orientation.FaceUp);
};

export const setRowFaceDown = (state: Duel, rowCoords: RowCoords) => {
  setRowOrientation(state, rowCoords, Orientation.FaceDown);
};

export const immobiliseRow = (state: Duel, rowCoords: RowCoords) => {
  updateMonsters(state, rowCoords, immobiliseZone);
};

export const destroyHighestAtk = (
  state: Duel,
  dKey: DuellistKey,
  condition: (z: OccupiedZone) => boolean = () => true
) => {
  const rowCoords: RowCoords = [dKey, RowKey.Monster];
  if (!countMatchesInRow(state, rowCoords, condition)) {
    // no monsters exist, destroy nothing
    return;
  }

  const coords = [
    ...rowCoords,
    getHighestAtkZoneIdx(state, rowCoords, condition),
  ] as ZoneCoords;
  destroyAtCoords(state, coords);
};

export const destroyFirstFound = (
  state: Duel,
  rowCoords: RowCoords,
  condition: (z: OccupiedZone) => boolean = () => true
) => {
  if (!countMatchesInRow(state, rowCoords, condition)) {
    // no monsters exist, destroy nothing
    return;
  }

  const coords = [
    ...rowCoords,
    getFirstOccupiedZoneIdx(state, rowCoords, condition),
  ] as ZoneCoords;
  destroyAtCoords(state, coords);
};

export const updateMatches = (
  state: Duel,
  rowCoords: RowCoords,
  effect: (z: OccupiedZone, i: number) => void,
  condition: (z: OccupiedZone, i: number) => boolean = () => true
) => {
  getRow(state, rowCoords).forEach((z, i, zones) => {
    if (!isOccupied(z) || !condition(z, i)) return;
    effect(zones[i] as OccupiedZone, i);
  });
};

export const updateMonsters = (
  state: Duel,
  rowCoords: RowCoords,
  effect: (z: OccupiedMonsterZone, i: number) => void,
  condition: (z: OccupiedMonsterZone, i: number) => boolean = always
) => {
  updateMatches(
    state,
    rowCoords,
    (z, i) => effect(z as OccupiedMonsterZone, i),
    (z, i) => isMonster(z) && condition(z, i)
  );
};

export const clearFirstTrap = (state: Duel, targetKey: DuellistKey) => {
  const trapIdx = state[targetKey].spellTrapZones.findIndex(isTrap);
  if (trapIdx === -1) return; // no traps found
  clearZone(state, [targetKey, RowKey.SpellTrap, trapIdx]);
};

export const clearAllTraps = (state: Duel, targetKey: DuellistKey) => {
  state[targetKey].spellTrapZones.forEach((z, idx) => {
    if (!isTrap(z)) return;
    clearZone(state, [targetKey, RowKey.SpellTrap, idx]);
  });
};

export const powerDownHighestAtk = (
  state: Duel,
  targetKey: DuellistKey,
  atk: number = 500,
  def: number = 500
) => {
  const targetIdx = getHighestAtkZoneIdx(state, [targetKey, RowKey.Monster]);
  if (targetIdx === -1) return; // no monster to target
  permPowerUp(state, [targetKey, RowKey.Monster, targetIdx], -atk, -def);
};

export const checkTriggeredTraps = (
  state: Duel,
  coordsMap: ZoneCoordsMap,
  trapReducers: CardEffectMap<AutoEffectReducer>
): boolean => {
  const { otherSpellTrap } = coordsMap;
  for (const [i, z] of getRow(state, otherSpellTrap).entries()) {
    if (!isTrap(z)) continue;
    const reducer = trapReducers[z.id];
    if (!reducer) continue;
    const { name } = getCard(z.id);
    if (Array.isArray(reducer)) {
      console.error(`Multiple effects found for trap: ${name}`);
      continue;
    }

    const { condition, effect, text, noDiscard } = reducer;
    if (condition(state, coordsMap)) {
      // found valid trap, perform its effect instead of the original action
      const trapCoords = [...otherSpellTrap, i] as ZoneCoords;
      logEffectMessage(state, trapCoords, text);
      effect(state, coordsMap);
      if (!noDiscard) {
        // some traps are continuous
        clearZone(state, trapCoords);
      }
      return true;
    }
  }
  return false;
};

export const isRowCoordMatch = (c1: RowCoords, c2: RowCoords) => {
  return c1[0] === c2[0] && c1[1] === c2[1];
};

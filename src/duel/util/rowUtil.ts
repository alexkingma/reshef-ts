import { DKey, Orientation, RowKey } from "../enums/duel";
import { logEffectMessage } from "../util/logUtil";
import { getCard, getExodiaCards, getFinalCards } from "./cardUtil";
import { always } from "./common";
import {
  clearZone,
  destroyAtCoords,
  getZone,
  immobiliseZone,
  isEmpty,
  isMonster,
  isOccupied,
  isTrap,
  permPowerUp,
} from "./zoneUtil";

export const getRow = (state: Duel, [dKey, rKey]: RowCoords) => {
  return state.duellists[dKey][rKey];
};

export const hasFullExodia = (state: Duel, rowCoords: RowCoords) => {
  return rowContainsAllCards(state, rowCoords, ...getExodiaCards());
};

export const hasFullFINAL = (state: Duel, rowCoords: RowCoords) => {
  return rowContainsAllCards(state, rowCoords, ...getFinalCards());
};

export const getFirstEmptyZoneIdx = (state: Duel, coords: RowCoords) => {
  return getRow(state, coords).findIndex(isEmpty);
};

export const hasEmptyZone = (state: Duel, rowCoords: RowCoords) => {
  return getFirstEmptyZoneIdx(state, rowCoords) !== -1;
};

export const getFirstOccupiedZoneIdx = (
  state: Duel,
  rowCoords: RowCoords,
  condition: (z: OccupiedZone) => boolean = always
) => {
  const row = getRow(state, rowCoords);
  return row.findIndex((z) => isOccupied(z) && condition(z));
};

export const getHighestAtkZoneIdx = (
  state: Duel,
  rowCoords: RowCoords,
  condition: (z: OccupiedZone, i: number) => boolean = always
) => {
  let idx = -1;
  let highestAtk = -1;
  getRow(state, rowCoords).forEach((z, i) => {
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
  rowCoords: RowCoords,
  condition: (z: OccupiedZone, i: number) => boolean = always
) => {
  let idx = -1;
  let lowestAtk = Number.MAX_SAFE_INTEGER;
  getRow(state, rowCoords).forEach((z, i) => {
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
  rowCoords: RowCoords,
  id: CardId
) => {
  return getRow(state, rowCoords).findIndex((z) => z.id === id);
};

export const rowContainsCard = (
  state: Duel,
  rowCoords: RowCoords,
  id: CardId
) => {
  return hasMatchInRow(state, rowCoords, (z) => z.id === id);
};

export const rowContainsAllCards = (
  state: Duel,
  rowCoords: RowCoords,
  ...ids: CardId[]
) => {
  // all provided cards must be present in the given row
  // alternatively: none of the provided cards may NOT be present
  return ids.every((c) => rowContainsCard(state, rowCoords, c));
};

export const hasMatchInRow = (
  state: Duel,
  rowCoords: RowCoords,
  condition: (z: OccupiedZone, i: number) => boolean = always
) => {
  const row = getRow(state, rowCoords);
  return row.some((z, i) => isOccupied(z) && condition(z, i));
};

export const countMatchesInRow = (
  state: Duel,
  rowCoords: RowCoords,
  condition: (z: OccupiedZone, i: number) => boolean = always
) => {
  const row = getRow(state, rowCoords);

  // for-loop is 30% faster than filter/length
  let count = 0;
  for (let i = 0; i < row.length; i++) {
    if (isOccupied(row[i]) && condition(row[i] as OccupiedZone, i)) count++;
  }
  return count;
};

const setRowOrientation = (
  state: Duel,
  rowCoords: RowCoords,
  orientation: Orientation
) => {
  updateMatches(state, rowCoords, (z) => (z.orientation = orientation));
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

export const onHighestAtkZone = (
  state: Duel,
  rowCoords: RowCoords,
  condition: (z: OccupiedZone, i: number) => boolean,
  callback: (z: OccupiedMonsterZone, targetCoords: ZoneCoords) => void
) => {
  const idx = getHighestAtkZoneIdx(state, rowCoords, condition);
  if (idx === -1) return; // no mon meets condition, callback doesn't fire
  const z = getZone(state, [...rowCoords, idx]) as OccupiedMonsterZone;
  callback(z, [...rowCoords, idx]);
};

export const destroyHighestAtk = (
  state: Duel,
  dKey: DKey,
  condition: (z: OccupiedZone) => boolean = always
) => {
  const rowCoords: RowCoords = [dKey, RowKey.Monster];
  onHighestAtkZone(state, rowCoords, condition, (_, coords) => {
    destroyAtCoords(state, coords);
  });
};

export const destroyFirstFound = (
  state: Duel,
  rowCoords: RowCoords,
  condition: (z: OccupiedZone) => boolean = always
) => {
  const i = getFirstOccupiedZoneIdx(state, rowCoords, condition);
  if (i === -1) return;
  destroyAtCoords(state, [...rowCoords, i]);
};

export const destroyRow = (
  state: Duel,
  rowCoords: RowCoords,
  condition: (zone: OccupiedZone) => boolean = always
) => {
  updateMatches(
    state,
    rowCoords,
    (_, i) => destroyAtCoords(state, [...rowCoords, i]),
    condition
  );
};

export const updateMatches = (
  state: Duel,
  rowCoords: RowCoords,
  effect: (z: OccupiedZone, i: number) => void,
  condition: (z: OccupiedZone, i: number) => boolean = always
) => {
  getRow(state, rowCoords).forEach((z, i, zones) => {
    if (isEmpty(z) || !condition(z, i)) return;
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

export const clearFirstTrap = (state: Duel, targetKey: DKey) => {
  destroyFirstFound(state, [targetKey, RowKey.SpellTrap], isTrap);
};

export const clearAllTraps = (state: Duel, targetKey: DKey) => {
  destroyRow(state, [targetKey, RowKey.SpellTrap], isTrap);
};

export const powerDownHighestAtk = (
  state: Duel,
  targetKey: DKey,
  atk: number = 500,
  def: number = 500
) => {
  onHighestAtkZone(state, [targetKey, RowKey.Monster], always, (_, coords) =>
    permPowerUp(state, coords, -atk, -def)
  );
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

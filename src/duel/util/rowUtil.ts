import {
  CounterAttackCard,
  CounterSpellCard,
  Orientation,
  RowKey,
} from "../common";
import { getCard, getExodiaCards, getFinalCards } from "./cardUtil";
import { getGraveyardCard, isGraveyardEmpty } from "./graveyardUtil";
import {
  clearZone,
  destroyAtCoords,
  immobiliseCard,
  isMonster,
  isTrap,
  permPowerUp,
  tempPowerUp,
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
  const nextFreeZoneIdx = row.findIndex((zone) => !zone.isOccupied);
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
  [dKey, rKey]: RowCoords,
  condition: (z: OccupiedZone) => boolean = () => true
) => {
  const zone = state[dKey][rKey];
  return zone.findIndex((z) => z.isOccupied && condition(z));
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
    if (z.card.effAtk > highestAtk) {
      highestAtk = z.card.effAtk;
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
    if (z.card.effAtk < lowestAtk) {
      lowestAtk = z.card.effAtk;
      idx = i;
    }
  });
  return idx;
};

export const getFirstSpecficCardIdx = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  cardName: CardName
) => {
  const row = state[dKey][rKey];
  return row.findIndex((z) => z.isOccupied && z.card.name === cardName);
};

export const rowContainsAnyCards = (
  state: Duel,
  rowCoords: RowCoords,
  ...cardNames: CardName[]
) => {
  return cardNames.some((c) =>
    hasMatchInRow(state, rowCoords, (z) => z.card.name === c)
  );
};

export const rowContainsAllCards = (
  state: Duel,
  rowCoords: RowCoords,
  ...cardNames: CardName[]
) => {
  // all provided cards must be present in the given row
  // alternatively: none of the provided cards may NOT be present
  return cardNames.every((c) => rowContainsAnyCards(state, rowCoords, c));
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
  return row.filter((z, i) => z.isOccupied && condition(z, i)).length;
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
  updateMatches(state, rowCoords, (_, idx) => {
    immobiliseCard(state, [...rowCoords, idx]);
  });
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
    if (!z.isOccupied || !condition(z, i)) return;
    effect(zones[i] as OccupiedZone, i);
  });
};

export const updateMonsters = (
  state: Duel,
  rowCoords: RowCoords,
  effect: (z: OccupiedMonsterZone, i: number) => void,
  condition: (z: OccupiedMonsterZone, i: number) => boolean = () => true
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

export const countConditional = (
  rowConditionPairs: (
    | [Duel, RowCoords, (z: Zone) => boolean]
    | [Duel, RowCoords, (z: Zone) => boolean, number]
  )[],
  graveyardConditionPairs: (
    | [Duel, DuellistKey, (c: MonsterCard) => boolean]
    | [Duel, DuellistKey, (c: MonsterCard) => boolean, number]
  )[] = []
) => {
  let count = 0;
  rowConditionPairs.forEach(([state, coords, condition, value = 1]) => {
    // TODO: exclude origin monster from the condition?
    count += countMatchesInRow(state, coords, condition) * value;
  });
  graveyardConditionPairs.forEach(([state, dKey, condition, value = 1]) => {
    if (
      !isGraveyardEmpty(state, dKey) &&
      condition(getCard(getGraveyardCard(state, dKey)) as MonsterCard)
    ) {
      count += value;
    }
  });
  return count;
};

export const powerUpSelfConditional = (
  state: Duel,
  coords: ZoneCoords,
  rowConditionPairs: (
    | [Duel, RowCoords, (z: Zone) => boolean]
    | [Duel, RowCoords, (z: Zone) => boolean, number]
  )[],
  graveyardConditionPairs: (
    | [Duel, DuellistKey, (c: MonsterCard) => boolean]
    | [Duel, DuellistKey, (c: MonsterCard) => boolean, number]
  )[] = []
) => {
  let count = countConditional(rowConditionPairs, graveyardConditionPairs);
  tempPowerUp(state, coords, count);
};

export const powerDownHighestAtk = (state: Duel, targetKey: DuellistKey) => {
  const targetIdx = getHighestAtkZoneIdx(state, [targetKey, RowKey.Monster]);
  if (targetIdx === -1) return; // no monster to target
  permPowerUp(state, [targetKey, RowKey.Monster, targetIdx], -1);
};

export const checkTriggeredTraps = <
  T extends CounterAttackCard | CounterSpellCard,
>(
  state: Duel,
  coordsMap: ZoneCoordsMap,
  trapReducers: CardReducerMap<T, EffConReducer>
): boolean => {
  const { otherSpellTrap } = coordsMap;
  for (const [trapIdx, z] of getRow(state, otherSpellTrap).entries()) {
    if (!z.isOccupied) continue;
    if (isTrap(z)) {
      const reducer = trapReducers[z.card.name as T];
      if (!reducer) continue;

      const { condition, effect } = reducer(state, coordsMap);
      if (condition(state, coordsMap)) {
        // found valid trap, perform its effect instead of the original action
        console.log(`%c${z.card.name}`, "color: #AC4E8D;");
        effect(state, coordsMap);
        clearZone(state, [...otherSpellTrap, trapIdx] as ZoneCoords);
        return true;
      }
    }
  }
  return false;
};

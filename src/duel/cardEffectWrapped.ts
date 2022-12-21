import {
  burn as burnDirect,
  countConditional,
  destroyAtCoords,
  destroyRow,
  draw as drawDirect,
  heal as healDirect,
  permPowerUp as permPowerUpDirect,
  setField as setFieldDirect,
  tempPowerUp as tempPowerUpDirect,
  updateMatchesInRow,
} from "./cardEffectUtil";
import { Field, RowKey } from "./common";
import {
  CoordsMap,
  DuellistCoordsMap,
  StateMap,
  ZoneCoordsMap,
} from "./duelSlice";
import { countMatchesInRow, getHighestAtkZoneIdx } from "./duelUtil";

export const burnOther =
  (amt: number) =>
  ({ state }: StateMap, { otherDKey }: CoordsMap) => {
    burnDirect(state, otherDKey, amt);
  };

export const heal =
  (amt: number) =>
  ({ state }: StateMap, { dKey }: CoordsMap) => {
    healDirect(state, dKey, amt);
  };

export const permPowerUp =
  (levels: number = 1) =>
  ({ state }: StateMap, { zoneCoords }: ZoneCoordsMap) => {
    permPowerUpDirect(state, zoneCoords, levels);
  };

export const setField =
  (newField: Field) =>
  ({ state }: StateMap) => {
    setFieldDirect(state, newField);
  };

export const destroyRows =
  (rowsToDestroy: RowCoords[]) =>
  ({ state }: StateMap) => {
    rowsToDestroy.forEach(([dKey, rKey]) =>
      destroyRow(state, [dKey, rKey as RowKey])
    );
  };

export const destroyHighestAtk =
  () =>
  ({ state, targetState }: StateMap, { otherMonsters }: CoordsMap) => {
    if (!targetState.monsterZones.some((z) => z.isOccupied)) {
      // no monsters exist, destroy nothing
      return;
    }

    const coords = [
      ...otherMonsters,
      getHighestAtkZoneIdx(state, otherMonsters),
    ] as ZoneCoords;
    destroyAtCoords(state, coords);
  };

const destroyMonsterConditional =
  (condition: (c: MonsterCard) => boolean) =>
  ({ state, targetState }: StateMap, { otherMonsters }: CoordsMap) => {
    const validColIdxs = targetState.monsterZones.reduce(
      (validCols, z, idx) => {
        if (z.isOccupied && condition(z.card)) {
          return [...validCols, idx];
        }
        return validCols;
      },
      [] as number[]
    );

    if (!validColIdxs.length) {
      // no applicable monsters exist, destroy nothing
      return;
    }

    const coords = validColIdxs.map((col) => [
      ...otherMonsters,
      col,
    ]) as ZoneCoords[];

    coords.forEach((coord) => destroyAtCoords(state, coord));
  };

export const destroy1500PlusAtk = () =>
  destroyMonsterConditional((card) => card.atk >= 1500);

export const destroyMonsterType = (type: CardType) =>
  destroyMonsterConditional((card) => card.type === type);

export const destroyMonsterAlignment = (alignment: Alignment) =>
  destroyMonsterConditional((card) => card.alignment === alignment);

export const draw =
  (numCards: number = 1) =>
  ({ state }: StateMap, { dKey }: DuellistCoordsMap) => {
    drawDirect(state, dKey, numCards);
  };

export const getEffCon_powerUpSelfConditional = (
  rowConditionPairs: (
    | [Duel, RowCoords, (z: Zone) => boolean]
    | [Duel, RowCoords, (z: Zone) => boolean, number]
  )[],
  graveyardConditionPairs: (
    | [Duel, DuellistKey, (c: MonsterCard) => boolean]
    | [Duel, DuellistKey, (c: MonsterCard) => boolean, number]
  )[] = []
) => {
  return {
    condition: () => {
      return countConditional(rowConditionPairs, graveyardConditionPairs) > 0;
    },
    effect: ({ state }: StateMap, { zoneCoords }: ZoneCoordsMap) => {
      const count = countConditional(
        rowConditionPairs,
        graveyardConditionPairs
      );
      tempPowerUpDirect(state, zoneCoords, count);
    },
  };
};

export const getEffCon_updateMatchesInRow = (
  state: Duel,
  coords: RowCoords,
  condition: (z: OccupiedMonsterZone) => boolean,
  effect: (z: OccupiedMonsterZone) => void
) => {
  return {
    condition: () => {
      return (
        countMatchesInRow(state, coords, (z) =>
          condition(z as OccupiedMonsterZone)
        ) > 0
      );
    },
    effect: () => {
      updateMatchesInRow(state, coords, condition, effect);
    },
  };
};

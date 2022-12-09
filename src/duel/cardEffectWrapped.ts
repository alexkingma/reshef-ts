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
import { DuellistKey, Field, RowKey } from "./common";
import { ReducerArg } from "./duelSlice";
import { countMatchesInRow, getHighestAtkZoneIdx } from "./duelUtil";

export const burn =
  (amt: number) =>
  ({ targetState }: ReducerArg) => {
    burnDirect(targetState, amt);
  };

export const heal =
  (amt: number) =>
  ({ originatorState }: ReducerArg) => {
    healDirect(originatorState, amt);
  };

export const permPowerUp =
  (levels: number = 1) =>
  ({ originatorState }: ReducerArg, monsterIdx: FieldCol) => {
    permPowerUpDirect(originatorState, monsterIdx, levels);
  };

export const setField =
  (newField: Field) =>
  ({ state }: ReducerArg) => {
    setFieldDirect(state, newField);
  };

export const destroyRows =
  (rowsToDestroy: RowCoords[]) =>
  ({ originatorState, targetState }: ReducerArg) => {
    // player rows
    rowsToDestroy.forEach(([dKey, rKey]) =>
      destroyRow(
        dKey === DuellistKey.Player ? originatorState : targetState,
        rKey as RowKey
      )
    );
  };

export const destroyHighestAtk =
  () =>
  ({ targetState }: ReducerArg) => {
    if (!targetState.monsterZones.filter((z) => z.isOccupied).length) {
      // no monsters exist, destroy nothing
      return;
    }
    const coords = [
      RowKey.Monster,
      getHighestAtkZoneIdx(targetState.monsterZones),
    ] as ZoneCoordsForDuellist;
    destroyAtCoords(targetState, coords);
  };

const destroyMonsterConditional =
  (condition: (c: MonsterCard) => boolean) =>
  ({ targetState }: ReducerArg) => {
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
      RowKey.Monster,
      col,
    ]) as ZoneCoordsForDuellist[];

    coords.forEach((coord) => destroyAtCoords(targetState, coord));
  };

export const destroy1500PlusAtk = () =>
  destroyMonsterConditional((card) => card.atk >= 1500);

export const destroyMonsterType = (type: CardType) =>
  destroyMonsterConditional((card) => card.type === type);

export const destroyMonsterAlignment = (alignment: Alignment) =>
  destroyMonsterConditional((card) => card.alignment === alignment);

export const draw =
  (numCards: number = 1) =>
  ({ originatorState }: ReducerArg) => {
    drawDirect(originatorState, numCards);
  };

export const getEffCon_powerUpSelfConditional = (
  rowConditionPairs: (
    | [Zone[], (z: Zone) => boolean]
    | [Zone[], (z: Zone) => boolean, number]
  )[],
  graveyardConditionPairs: (
    | [CardName | null, (c: MonsterCard) => boolean]
    | [CardName | null, (c: MonsterCard) => boolean, number]
  )[] = []
) => {
  return {
    condition: () => {
      return countConditional(rowConditionPairs, graveyardConditionPairs) > 0;
    },
    effect: ({ originatorState }: ReducerArg, monsterIdx: FieldCol) => {
      const count = countConditional(
        rowConditionPairs,
        graveyardConditionPairs
      );
      tempPowerUpDirect(originatorState, monsterIdx, count);
    },
  };
};

export const getEffCon_updateMatchesInRow = (
  row: MonsterZone[],
  condition: (z: OccupiedMonsterZone) => boolean,
  effect: (z: OccupiedMonsterZone) => void
) => {
  return {
    condition: () => {
      return (
        countMatchesInRow(row, (z) => condition(z as OccupiedMonsterZone)) > 0
      );
    },
    effect: () => {
      updateMatchesInRow(row, condition, effect);
    },
  };
};

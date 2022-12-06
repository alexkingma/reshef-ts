import {
  burn as burnDirect,
  destroyAtCoords,
  destroyRow,
  draw as drawDirect,
  heal as healDirect,
  permPowerUp as permPowerUpDirect,
  setField as setFieldDirect,
} from "./cardEffectUtil";
import { Field, FieldCoords, FieldRow } from "./common";
import { ReducerArg } from "./duelSlice";
import { getHighestAtkZoneIdx } from "./duelUtil";

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
  (rowsToDestroy: FieldRow[]) =>
  ({ originatorState, targetState }: ReducerArg) => {
    // player rows
    rowsToDestroy
      .filter((r) =>
        [
          FieldRow.PlayerHand,
          FieldRow.PlayerMonster,
          FieldRow.PlayerSpellTrap,
        ].includes(r)
      )
      .forEach((r) => destroyRow(originatorState, r));

    // opponent rows
    rowsToDestroy
      .filter((r) =>
        [
          FieldRow.OpponentHand,
          FieldRow.OpponentMonster,
          FieldRow.OpponentSpellTrap,
        ].includes(r)
      )
      .forEach((r) => destroyRow(targetState, r));
  };

export const destroyHighestAtk =
  () =>
  ({ targetState }: ReducerArg) => {
    if (!targetState.monsterZones.filter((z) => z.isOccupied).length) {
      // no monsters exist, destroy nothing
      return;
    }
    const coords = [
      FieldRow.OpponentMonster,
      getHighestAtkZoneIdx(targetState.monsterZones),
    ] as FieldCoords;
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
      FieldRow.OpponentMonster,
      col,
    ]) as FieldCoords[];

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

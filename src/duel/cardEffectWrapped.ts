import {
  destroyAtCoords,
  destroyRow,
  powerUp as powerUpDirect,
} from "./cardEffectUtil";
import { Field, FieldRow, Orientation } from "./common";
import { ReducerArg } from "./duelSlice";
import { getFirstEmptyZoneIdx, getHighestAtkZoneIdx } from "./duelUtil";

export const burn =
  (amt: number) =>
  ({ targetState }: ReducerArg) => {
    targetState.lp -= amt;
  };

export const heal =
  (amt: number) =>
  ({ originatorState }: ReducerArg) => {
    originatorState.lp += amt;
  };

export const powerUp =
  (levels: number = 1) =>
  ({ originatorState }: ReducerArg, monsterIdx: FieldCol) => {
    powerUpDirect(originatorState.monsterZones, monsterIdx, levels);
  };

export const setField =
  (newField: Field) =>
  ({ state }: ReducerArg) => {
    state.activeField = newField;
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

export const draw =
  (numCards: number = 1) =>
  ({ originatorState }: ReducerArg) => {
    for (let i = 0; i < numCards; i++) {
      let zoneIdx: number;
      try {
        zoneIdx = getFirstEmptyZoneIdx(originatorState.hand);
      } catch (e) {
        // no space available in hand, don't draw a card
        return;
      }

      const card = originatorState.deck.shift();
      if (!card) {
        // TODO: player is out of cards, end game
        return;
      }

      originatorState.hand[zoneIdx] = {
        isOccupied: true,
        card,
        orientation: Orientation.FaceDown,
      };
    }
  };

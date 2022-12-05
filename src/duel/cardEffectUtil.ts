import { Field, FieldRow, Orientation } from "./common";
import { ReducerArg } from "./duelSlice";
import {
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
  getZoneKey,
} from "./duelUtil";

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
  ({ targetState }: ReducerArg, monsterIdx: FieldCol) => {
    const zone = targetState.monsterZones[monsterIdx] as OccupiedMonsterZone;
    zone.powerUpLevel += levels;
  };

export const setField =
  (newField: Field) =>
  ({ state }: ReducerArg) => {
    state.activeField = newField;
  };

const destroyRow = (state: Duellist, row: FieldRow) => {
  state[getZoneKey(row)].forEach((zone, idx) => {
    if (zone.isOccupied) {
      destroyAtCoords(state, [row, idx as FieldCol]);
    }
  });
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

export const destroyAtCoords = (state: Duellist, coords: FieldCoords) => {
  const [row, col] = coords;
  const zone = state[getZoneKey(row)][col];
  if (zone.isOccupied && zone.card.category === "Monster") {
    state.graveyard = zone.card.name;
  }
  clearZone(state[getZoneKey(row)], col);
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

export const clearGraveyard = (duellist: Duellist) => {
  duellist.graveyard = null;
};

export const clearZone = (row: Zone[], idx: number) => {
  // does NOT send anything to graveyard
  row[idx] = { isOccupied: false };
};

const setRowOrientation = (row: Zone[], orientation: Orientation) => {
  row.forEach((zone, idx, row) => {
    if (!zone.isOccupied) return;
    (row[idx] as OccupiedZone).orientation = orientation;
  });
};

export const setRowFaceUp = (row: Zone[]) => {
  setRowOrientation(row, Orientation.FaceUp);
};

export const setRowFaceDown = (row: Zone[]) => {
  setRowOrientation(row, Orientation.FaceDown);
};

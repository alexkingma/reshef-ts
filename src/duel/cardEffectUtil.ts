import { FieldRow, Orientation } from "./common";
import { getZoneKey } from "./duelUtil";

export const powerUp = (
  zones: MonsterZone[],
  monsterIdx: FieldCol,
  levels: number = 1
) => {
  (zones[monsterIdx] as OccupiedMonsterZone).powerUpLevel += levels;
};

export const destroyRow = (state: Duellist, row: FieldRow) => {
  state[getZoneKey(row)].forEach((zone, idx) => {
    if (zone.isOccupied) {
      destroyAtCoords(state, [row, idx as FieldCol]);
    }
  });
};

export const destroyAtCoords = (state: Duellist, coords: FieldCoords) => {
  const [row, col] = coords;
  const zone = state[getZoneKey(row)][col];
  if (!zone.isOccupied) return;
  if (zone.card.category === "Monster") {
    state.graveyard = zone.card.name;
  }
  clearZone(state[getZoneKey(row)], col);
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

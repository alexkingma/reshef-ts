import { default as fieldMultiplierMap } from "@/assets/data/fields.json";
import { DKey, Field, Orientation, RowKey } from "../enums/duel";
import { Spell } from "../enums/spellTrapRitual";
import { getCard } from "./cardUtil";
import { getOtherDuellistKey } from "./duellistUtil";
import {
  clearZone,
  getZone,
  isEmpty,
  isOccupied,
  setCardAtCoords,
} from "./zoneUtil";

export const getFieldCardId = (field: Field): Spell => {
  switch (field) {
    case Field.Yami:
      return Spell.Yami;
    case Field.Wasteland:
      return Spell.Wasteland;
    case Field.Mountain:
      return Spell.Mountain;
    case Field.Sogen:
      return Spell.Sogen;
    case Field.Umi:
      return Spell.Umi;
    case Field.Forest:
      return Spell.Forest;
    default:
      throw new Error(`Unknown field: ${field}`);
  }
};

export const getRandomFieldCard = () => {
  const fields = [
    Field.Yami,
    Field.Wasteland,
    Field.Mountain,
    Field.Sogen,
    Field.Umi,
    Field.Forest,
  ];
  return fields[Math.floor(Math.random() * fields.length)];
};

export const setActiveField = (state: Duel, dKey: DKey, field: Field) => {
  // always clear the opponent's field slot on principle
  clearActiveField(state, getOtherDuellistKey(dKey));

  if (field === Field.Arena) {
    // setting the field to "Arena" actually means removing
    // any active field cards, rather than setting one
    clearActiveField(state, dKey);
  } else {
    setCardAtCoords(state, [dKey, RowKey.Field, 0], getFieldCardId(field), {
      orientation: Orientation.FaceUp,
    });
  }
};

export const getActiveField = (state: Duel): Field => {
  return (
    getFieldCard(state, DKey.Player) ??
    getFieldCard(state, DKey.Opponent) ??
    Field.Arena
  );
};

export const getFieldCard = (state: Duel, dKey: DKey): Field | null => {
  const [z] = state.duellists[dKey].fieldZone;
  if (isEmpty(z)) return null;
  const { name } = getCard(z.id);
  return name as Field;
};

export const getFieldMultiplier = (field: Field, type: CardType) => {
  const map = fieldMultiplierMap[field] as { [key in CardType]: number };
  return map[type] || 1;
};

export const isBuffedByField = (type: CardType, field: Field): boolean => {
  return getFieldMultiplier(field, type) > 1;
};

export const hasActiveField = (state: Duel, dKey: DKey) => {
  const z = getZone(state, [dKey, RowKey.Field, 0]);
  return isOccupied(z);
};

export const clearActiveField = (state: Duel, dKey: DKey) => {
  clearZone(state, [dKey, RowKey.Field, 0]);
};

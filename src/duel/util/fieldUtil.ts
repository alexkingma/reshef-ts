import { default as fieldMultiplierMap } from "@/assets/fields.json";
import { Field, Orientation, RowKey, Spell } from "../common";
import { getCard } from "./cardUtil";
import { getOtherDuellistKey } from "./duellistUtil";
import { clearZone, getZone } from "./zoneUtil";

export const getFieldCardId = (field: Field): FieldId => {
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

export const setActiveField = (
  state: Duel,
  dKey: DuellistKey,
  field: Field
) => {
  // always clear the opponent's field slot on principle
  clearActiveField(state, getOtherDuellistKey(dKey));

  if (field === Field.Arena) {
    // setting the field to "Arena" actually means removing
    // any active field cards, rather than setting one
    clearActiveField(state, dKey);
  } else {
    state[dKey].fieldZone[0] = {
      isOccupied: true,
      card: getCard(getFieldCardId(field)),
      orientation: Orientation.FaceUp,
    };
  }
};

export const getActiveField = (state: Duel): Field => {
  const pZone = state.p1.fieldZone[0];
  const oZone = state.p2.fieldZone[0];
  const pField = pZone.isOccupied ? (pZone.card.name as Field) : Field.Arena;
  const oField = oZone.isOccupied ? (oZone.card.name as Field) : Field.Arena;
  return pField === Field.Arena ? oField : pField;
};

export const getFieldCard = (state: Duel, dKey: DuellistKey): Field | null => {
  const [z] = state[dKey].fieldZone;
  return z.isOccupied ? (z.card.name as Field) : null;
};

export const getFieldMultiplier = (field: Field, type: CardType) => {
  const map = fieldMultiplierMap[field] as { [key in CardType]: number };
  return map[type] || 1;
};

export const isBuffedByField = (type: CardType, field: Field): boolean => {
  return getFieldMultiplier(field, type) > 1;
};

export const hasActiveField = (state: Duel, dKey: DuellistKey) => {
  const z = getZone(state, [dKey, RowKey.Field, 0]);
  return z.isOccupied;
};

export const clearActiveField = (state: Duel, dKey: DuellistKey) => {
  clearZone(state, [dKey, RowKey.Field, 0]);
};

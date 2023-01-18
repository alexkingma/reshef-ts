import { Field, Orientation } from "../common";
import { getCard } from "./cardUtil";
import { getOtherDuellistKey } from "./duellistUtil";

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
  const otherDKey = getOtherDuellistKey(dKey);
  state[otherDKey].fieldZone[0] = { isOccupied: false };
  state[dKey].fieldZone[0] = {
    isOccupied: true,
    card: getCard(field as FieldName) as Card<FieldName>,
    orientation: Orientation.FaceUp,
  };
};

export const getActiveField = (state: Duel): Field => {
  const pZone = state.p1.fieldZone[0];
  const oZone = state.p2.fieldZone[0];
  const pField = pZone.isOccupied ? (pZone.card.name as Field) : Field.Arena;
  const oField = oZone.isOccupied ? (oZone.card.name as Field) : Field.Arena;
  return pField === Field.Arena ? oField : pField;
};

export const getFieldZone = (state: Duel, dKey: DuellistKey): Field | null => {
  const z = state[dKey].fieldZone[0];
  return z.isOccupied ? (z.card.name as Field) : null;
};

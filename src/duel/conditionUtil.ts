import { ReducerArg } from "./duelSlice";

export const containsCard = (row: Zone[], cardName: CardName) => {
  return !!row.find((r) => r.isOccupied && r.card.name === cardName);
};

export const containsAllCards = (row: Zone[], cardNames: CardName[]) => {
  // all provided cards must be present in the given row
  // alternatively: none of the provided cards must NOT be present
  return !cardNames.filter((c) => !containsCard(row, c)).length;
};

export const isVictor = ({ originatorState, targetState }: ReducerArg) => {
  // TODO: opponent deck-out flag
  return (
    targetState.lp === 0 ||
    hasFullExodia(originatorState.hand) ||
    hasFullFINAL(originatorState.spellTrapZones)
  );
};

export const hasFullExodia = (hand: HandZone[]) => {
  const cards: CardName[] = [
    "Exodia the Forbidden One",
    "Left Arm of the Forbidden One",
    "Left Leg of the Forbidden One",
    "Right Arm of the Forbidden One",
    "Right Leg of the Forbidden One",
  ];
  return containsAllCards(hand, cards);
};

export const hasFullFINAL = (spellTrapRow: SpellTrapZone[]) => {
  const cards: CardName[] = [
    "Final Destiny",
    'Spirit Message "I"',
    'Spirit Message "N"',
    'Spirit Message "A"',
    'Spirit Message "L"',
  ];
  return containsAllCards(spellTrapRow, cards);
};

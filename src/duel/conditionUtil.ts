import { Monster, Trap } from "./common";
import { ReducerArg } from "./duelSlice";

export const containsCard = (row: Zone[], cardName: CardName) => {
  return !!row.find((r) => r.isOccupied && r.card.name === cardName);
};

export const containsAllCards = (row: Zone[], cardNames: CardName[]) => {
  // all provided cards must be present in the given row
  // alternatively: none of the provided cards may NOT be present
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
  return containsAllCards(hand, [
    Monster.ExodiaTheForbiddenOne,
    Monster.LeftArmOfTheForbiddenOne,
    Monster.LeftLegOfTheForbiddenOne,
    Monster.RightArmOfTheForbiddenOne,
    Monster.RightLegOfTheForbiddenOne,
  ]);
};

export const hasFullFINAL = (spellTrapRow: SpellTrapZone[]) => {
  return containsAllCards(spellTrapRow, [
    Trap.DestinyBoard,
    Trap.SpiritMessageI,
    Trap.SpiritMessageN,
    Trap.SpiritMessageA,
    Trap.SpiritMessageL,
  ]);
};

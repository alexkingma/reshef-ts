import { Field, InteractionMode, RowKey } from "../common";
import { randomiseDuellistState } from "./duellistUtil";

export const getInitialDuel = (
  cardQuantMap1: CardQuantityMap,
  cardQuantMap2: CardQuantityMap
): Duel => {
  return {
    p1: randomiseDuellistState("Player", cardQuantMap1),
    p2: randomiseDuellistState("Opponent", cardQuantMap2),
    activeTurn: {
      duellistKey: "p1",
      isStartOfTurn: true,
      hasNormalSummoned: false,
      numTributedMonsters: 0,
    },
    activeField: Field.Arena,
    interaction: {
      cursorCoords: ["p1", RowKey.Hand, 0],
      originCoords: null,
      targetCoords: null,
      mode: InteractionMode.FreeMovement,
      pendingAction: null,
    },
  };
};

export const isStartOfEitherTurn = (state: Duel) => {
  return state.activeTurn.isStartOfTurn;
};

export const isVictor = (state: Duel) => {
  // TODO: opponent deck-out flag
  // return (
  //   targetState.lp === 0 ||
  //   hasFullExodia(originatorState.hand) ||
  //   hasFullFINAL(originatorState.spellTrapZones)
  // );
};

export const setField = (state: Duel, field: Field) => {
  state.activeField = field;
};

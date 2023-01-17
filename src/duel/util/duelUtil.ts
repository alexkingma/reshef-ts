import { Field, InteractionMode, RowKey } from "../common";
import { generateNewDuellist, randomiseDuellistState } from "./duellistUtil";

export const getRandomDuel = (): Duel => {
  return {
    p1: randomiseDuellistState("Player"),
    p2: randomiseDuellistState("Opponent"),
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

export const getNewDuel = (): Duel => {
  return {
    p1: generateNewDuellist("Player"),
    p2: generateNewDuellist("Opponent"),
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

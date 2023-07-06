import {
  DuellistKey,
  DuellistStatus,
  InteractionMode,
  RowKey,
} from "../common";
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

export const isDuelOver = (state: Duel): boolean => {
  // determine if either side has fulfilled a win/lose condition
  return (
    state.p1.status !== DuellistStatus.HEALTHY ||
    state.p2.status !== DuellistStatus.HEALTHY
  );
};

export const postDuelEffect = (state: Duel) => {
  const victor =
    state.p1.status === DuellistStatus.DECK_OUT ||
    state.p1.status === DuellistStatus.OUT_OF_LP ||
    state.p1.status === DuellistStatus.SURRENDER ||
    state.p2.status === DuellistStatus.EXODIA ||
    state.p2.status === DuellistStatus.DESTINY_BOARD
      ? DuellistKey.Opponent
      : DuellistKey.Player;

  console.log(`${victor} won the duel!`);
};

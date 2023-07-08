import {
  DuellistKey,
  DuellistStatus,
  InteractionMode,
  RowKey,
} from "../common";
import { getTempCardQuantMap } from "./deckUtil";
import { getDuellistState, getFreshDuellistState } from "./duellistUtil";

export const getRandomDuel = (): Duel => {
  return {
    config: getDefaultConfig(),
    p1: getDuellistState(),
    p2: getDuellistState(),
    activeTurn: getDefaultActiveTurn(),
    interaction: getDefaultInteraction(),
  };
};

export const getNewDuel = (
  cardQuantMap1: CardQuantityMap,
  cardQuantMap2: CardQuantityMap
): Duel => {
  return {
    config: getDefaultConfig(),
    p1: getFreshDuellistState("Player", cardQuantMap1),
    p2: getFreshDuellistState("Opponent", cardQuantMap2),
    activeTurn: getDefaultActiveTurn(),
    interaction: getDefaultInteraction(),
  };
};

export const getDefaultConfig = (): DuelConfig => {
  return {
    p1Type: "player",
    p2Type: "computer",
    p1Deck: getTempCardQuantMap(),
    p2Deck: getTempCardQuantMap(),
    computerDelayMs: 1000,
    remainingDuels: 0,
  };
};

export const getDefaultActiveTurn = (): Turn => {
  return {
    duellistKey: "p1",
    isStartOfTurn: true,
    hasNormalSummoned: false,
    numTributedMonsters: 0,
  };
};

export const getDefaultInteraction = (): DuelInteraction => {
  return {
    cursorCoords: ["p1", RowKey.Hand, 0],
    originCoords: null,
    targetCoords: null,
    mode: InteractionMode.FreeMovement,
    pendingAction: null,
  };
};

export const isStartOfEitherTurn = (state: Duel) => {
  return state.activeTurn.isStartOfTurn;
};

export const postDuelEffect = (state: Duel) => {
  // TODO: unused?
  const victor =
    state.p1.status === DuellistStatus.DECK_OUT ||
    state.p1.status === DuellistStatus.OUT_OF_LP ||
    state.p1.status === DuellistStatus.SURRENDER ||
    state.p2.status === DuellistStatus.EXODIA ||
    state.p2.status === DuellistStatus.DESTINY_BOARD
      ? DuellistKey.Opponent
      : DuellistKey.Player;

  console.log(`%c${victor} won the duel!`, "color:#d4af37");
};

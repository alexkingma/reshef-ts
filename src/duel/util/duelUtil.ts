import {
  DuellistKey,
  DuellistStatus,
  InteractionMode,
  PlayerType,
  RowKey,
} from "../common";
import { getTempCardQuantMap } from "./deckUtil";
import { getDuellistState, getFreshDuellistState } from "./duellistUtil";

export const getRandomDuel = (): Duel => {
  const cardQuantMap1 = getTempCardQuantMap();
  const cardQuantMap2 = getTempCardQuantMap();
  return {
    config: getDefaultConfig(cardQuantMap1, cardQuantMap2),
    p1: getDuellistState(cardQuantMap1),
    p2: getDuellistState(cardQuantMap2),
    activeTurn: getDefaultActiveTurn(),
    interaction: getDefaultInteraction(),
  };
};

export const getNewDuel = (
  cardQuantMap1: CardQuantityMap,
  cardQuantMap2: CardQuantityMap
): Duel => {
  return {
    config: getDefaultConfig(cardQuantMap1, cardQuantMap2),
    p1: getFreshDuellistState("Player", cardQuantMap1),
    p2: getFreshDuellistState("Opponent", cardQuantMap2),
    activeTurn: getDefaultActiveTurn(),
    interaction: getDefaultInteraction(),
  };
};

export const getDefaultConfig = (
  cardQuantMap1: CardQuantityMap,
  cardQuantMap2: CardQuantityMap
): DuelConfig => {
  return {
    p1Type: PlayerType.Computer,
    p2Type: PlayerType.Computer,
    p1Deck: cardQuantMap1,
    p2Deck: cardQuantMap2,
    computerDelayMs: 0,
    totalDuelsToPlay: 100,
    showDuelUI: false,
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

export const getVictorKey = (state: Duel): DuellistKey => {
  return state.p1.status === DuellistStatus.DECK_OUT ||
    state.p1.status === DuellistStatus.OUT_OF_LP ||
    state.p1.status === DuellistStatus.SURRENDER ||
    state.p2.status === DuellistStatus.EXODIA ||
    state.p2.status === DuellistStatus.DESTINY_BOARD
    ? DuellistKey.Opponent
    : DuellistKey.Player;
};

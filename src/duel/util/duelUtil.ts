import {
  DuellistKey,
  DuellistStatus,
  InteractionMode,
  PlayerType,
  RowKey,
} from "../common";
import {
  getFreshDuellistState,
  getRandomDuellable,
  getRandomDuellistState,
} from "./duellistUtil";

export const getRandomDuel = (): Duel => {
  return {
    config: getDefaultConfig(),
    p1: getRandomDuellistState(),
    p2: getRandomDuellistState(),
    activeTurn: getDefaultActiveTurn(),
    interaction: getDefaultInteraction(),
  };
};

export const getNewDuel = (
  name1?: DuellableName,
  name2?: DuellableName
): Duel => {
  return {
    config: getDefaultConfig(),
    p1: getFreshDuellistState(name1),
    p2: getFreshDuellistState(name2),
    activeTurn: getDefaultActiveTurn(),
    interaction: getDefaultInteraction(),
  };
};

export const getDefaultConfig = (): DuelConfig => {
  return {
    p1Type: PlayerType.Computer,
    p2Type: PlayerType.Computer,
    p1Name: getRandomDuellable().name,
    p2Name: getRandomDuellable().name,
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

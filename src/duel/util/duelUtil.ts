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
import { clearActiveField, hasActiveField } from "./fieldUtil";

export const getRandomDuel = (): Duel => {
  return removeSecondFieldSpell({
    config: getDefaultConfig(),
    p1: getRandomDuellistState(),
    p2: getRandomDuellistState(),
    activeTurn: getDefaultActiveTurn(),
    interaction: getDefaultInteraction(),
  });
};

export const getNewDuel = (
  name1?: DuellableName,
  name2?: DuellableName
): Duel => {
  return removeSecondFieldSpell({
    config: getDefaultConfig(),
    p1: getFreshDuellistState(name1),
    p2: getFreshDuellistState(name2),
    activeTurn: getDefaultActiveTurn(),
    interaction: getDefaultInteraction(),
  });
};

export const getDefaultConfig = (): DuelConfig => {
  return {
    p1Type: PlayerType.CPU,
    p2Type: PlayerType.CPU,
    p1Name: getRandomDuellable().name,
    p2Name: getRandomDuellable().name,
    cpuDelayMs: 0,
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

export const removeSecondFieldSpell = (state: Duel): Duel => {
  // RoD can only have one field active at a time, so if a duel spawns
  // with each duellist having a field spell active, remove p2's card.
  if (
    hasActiveField(state, DuellistKey.Player) &&
    hasActiveField(state, DuellistKey.Opponent)
  ) {
    clearActiveField(state, DuellistKey.Opponent);
  }

  // return for chaining purposes
  return state;
};

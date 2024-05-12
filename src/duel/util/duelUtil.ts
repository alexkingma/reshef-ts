import {
  DKey,
  DStatus,
  InteractionMode,
  PlayerType,
  RowKey,
} from "../enums/duel";
import {
  getFreshDuellistState,
  getRandomDuellable,
  getRandomDuellistState,
} from "./duellistUtil";
import { clearActiveField, hasActiveField } from "./fieldUtil";

export const getRandomDuel = (): Duel => {
  return removeSecondFieldSpell({
    config: getDefaultConfig(),
    duellists: [getRandomDuellistState(), getRandomDuellistState()],
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
    duellists: [getFreshDuellistState(name1), getFreshDuellistState(name2)],
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
    dKey: DKey.Player,
    isStartOfTurn: true,
    hasNormalSummoned: false,
    numTributedMonsters: 0,
  };
};

export const getDefaultInteraction = (): DuelInteraction => {
  return {
    cursorCoords: [DKey.Player, RowKey.Hand, 0],
    originCoords: null,
    targetCoords: null,
    mode: InteractionMode.FreeMovement,
    pendingAction: null,
  };
};

export const isStartOfEitherTurn = (state: Duel) => {
  return state.activeTurn.isStartOfTurn;
};

export const getVictorKey = (state: Duel): DKey => {
  const [p1, p2] = state.duellists;
  return p1.status === DStatus.DECK_OUT ||
    p1.status === DStatus.OUT_OF_LP ||
    p1.status === DStatus.SURRENDER ||
    p2.status === DStatus.EXODIA ||
    p2.status === DStatus.DESTINY_BOARD
    ? DKey.Opponent
    : DKey.Player;
};

export const removeSecondFieldSpell = (state: Duel): Duel => {
  // RoD can only have one field active at a time, so if a duel spawns
  // with each duellist having a field spell active, remove p2's card.
  if (
    hasActiveField(state, DKey.Player) &&
    hasActiveField(state, DKey.Opponent)
  ) {
    clearActiveField(state, DKey.Opponent);
  }

  // return for chaining purposes
  return state;
};

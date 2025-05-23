import {
  DKey,
  DStatus,
  DuelType,
  InteractionMode,
  PlayerType,
  RowKey,
} from "../enums/duel";
import {
  getEmptyDuellistState,
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

export const getEmptyDuel = (): Duel => {
  return {
    config: getDefaultConfig(),
    duellists: [getEmptyDuellistState(), getEmptyDuellistState()],
    activeTurn: getDefaultActiveTurn(),
    interaction: getDefaultInteraction(),
  };
};

export const getDefaultConfig = (): DuelConfig => {
  return {
    duelType: DuelType.Simulation,
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
    otherDKey: DKey.Opponent,

    originCoords: null,
    targetCoords: null,

    // own rows
    ownMonsters: [DKey.Player, RowKey.Monster],
    ownSpellTrap: [DKey.Player, RowKey.SpellTrap],
    ownHand: [DKey.Player, RowKey.Hand],
    ownGraveyard: [DKey.Player, RowKey.Graveyard],

    // opponent rows
    otherMonsters: [DKey.Opponent, RowKey.Monster],
    otherSpellTrap: [DKey.Opponent, RowKey.SpellTrap],
    otherHand: [DKey.Opponent, RowKey.Hand],
    otherGraveyard: [DKey.Opponent, RowKey.Graveyard],

    isStartOfTurn: true,
    hasNormalSummoned: false,
    numTributedMonsters: 0,
  };
};

export const getDefaultInteraction = (): DuelInteraction => {
  return {
    cursorCoords: [DKey.Player, RowKey.Hand, 0],
    mode: InteractionMode.FreeMovement,
    pendingCoords: null,
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

export const isDuelOver = (state: Duel): boolean => {
  // determine if either side has fulfilled a win/lose condition
  return state.duellists.some(({ status }) => status !== DStatus.HEALTHY);
};

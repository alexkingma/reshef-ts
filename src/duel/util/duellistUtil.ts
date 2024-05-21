import { duellists } from "@/assets/data/duellists";
import { BattlePosition, DKey, DStatus, Orientation } from "../enums/duel";
import { getRandomCardId } from "./cardUtil";
import { CARD_NONE } from "./common";
import { getTempCardQuantMap, initialiseDeck } from "./deckUtil";
import { isStartOfEitherTurn } from "./duelUtil";
import { getFieldCardId, getRandomFieldCard } from "./fieldUtil";
import { generateOccupiedMonsterZone, isCoordMatch } from "./zoneUtil";

const getEmptyRow = (): EmptyZone[] => {
  return Array.from({ length: 5 }).map(() => ({ id: CARD_NONE }));
};

export const getRandomDuellistState = (): Duellist => {
  const rand = () => Math.random() > 0.5;
  const cardQuantMap = getTempCardQuantMap();
  const deck = initialiseDeck(cardQuantMap);
  return {
    name: "Random Cards",
    lp: Math.ceil(Math.random() * 8) * 1000,
    deckTemplate: cardQuantMap,
    hand: deck.splice(0, 5).map((card) => (rand() ? { id: CARD_NONE } : card)),
    deck: deck.slice(0, Math.floor(Math.random() * 35)),
    graveyard: [
      {
        id: getRandomCardId({ category: "Monster" }),
        orientation: Orientation.FaceUp,
      },
    ],
    monsterZones: Array.from({ length: 5 }).map(() =>
      rand()
        ? { id: CARD_NONE }
        : {
            ...generateOccupiedMonsterZone(getRandomCardId({ effect: true })),
            battlePosition: rand()
              ? BattlePosition.Attack
              : BattlePosition.Defence,
            orientation: rand() ? Orientation.FaceDown : Orientation.FaceUp,
            permPowerUpAtk: (Math.floor(Math.random() * 9) - 5) * 500,
            permPowerUpDef: (Math.floor(Math.random() * 9) - 5) * 500,
          }
    ),
    spellTrapZones: Array.from({ length: 5 }).map(() =>
      rand()
        ? { id: CARD_NONE }
        : {
            id: getRandomCardId({ category: rand() ? "Trap" : "Magic" }),
            orientation: rand() ? Orientation.FaceDown : Orientation.FaceUp,
          }
    ),
    activeEffects: {
      sorlTurnsRemaining: 0,
      convertedZones: [],
    },
    fieldZone: [
      {
        id: getFieldCardId(getRandomFieldCard()),
        orientation: Orientation.FaceUp,
      },
    ],
    status: DStatus.HEALTHY,
  };
};

export const getFreshDuellistState = (name?: DuellableName): Duellist => {
  const isDuellable = !!name;
  const cardQuantMap = isDuellable
    ? getDuellable(name).deck
    : getTempCardQuantMap();
  const deck = initialiseDeck(cardQuantMap);
  return {
    name: isDuellable ? name : "Random Cards",
    lp: isDuellable ? getDuellable(name).lp : 8000,
    deckTemplate: cardQuantMap,
    hand: deck.splice(0, 5).map((card) => card),
    deck: deck,
    graveyard: [{ id: CARD_NONE }],
    monsterZones: getEmptyRow(),
    spellTrapZones: getEmptyRow(),
    activeEffects: {
      sorlTurnsRemaining: 0,
      convertedZones: [],
    },
    fieldZone: [
      isDuellable && getDuellable(name).field !== "Arena"
        ? {
            id: getFieldCardId(getDuellable(name).field),
            orientation: Orientation.FaceUp,
          }
        : { id: CARD_NONE },
    ],
    status: DStatus.HEALTHY,
  };
};

export const getEmptyDuellistState = (): Duellist => {
  return {
    name: "Empty State",
    lp: 8000,
    deckTemplate: {},
    hand: getEmptyRow(),
    deck: [],
    graveyard: [{ id: CARD_NONE }],
    monsterZones: getEmptyRow(),
    spellTrapZones: getEmptyRow(),
    activeEffects: {
      sorlTurnsRemaining: 0,
      convertedZones: [],
    },
    fieldZone: [{ id: CARD_NONE }],
    status: DStatus.HEALTHY,
  };
};

export const isOwnTurn = (state: Duel, dKey: DKey) => {
  return state.activeTurn.dKey === dKey;
};

export const isStartOfTurn = (state: Duel, dKey: DKey) => {
  return isStartOfEitherTurn(state) && isOwnTurn(state, dKey);
};

export const getOtherDuellistKey = (dKey: DKey): DKey => {
  // toggle 0 <-> 1
  return dKey ^ 1;
};

export const swapTurnRowCoords = (turn: Turn) => {
  // dKeys
  turn.dKey ^= 1;
  turn.otherDKey ^= 1;

  // own rows
  turn.ownMonsters[0] ^= 1;
  turn.ownSpellTrap[0] ^= 1;
  turn.ownHand[0] ^= 1;
  turn.ownGraveyard[0] ^= 1;

  // opp rows
  turn.otherMonsters[0] ^= 1;
  turn.otherSpellTrap[0] ^= 1;
  turn.otherHand[0] ^= 1;
  turn.otherGraveyard[0] ^= 1;
};

export const burn = (state: Duel, dKey: DKey, amt: number) => {
  const duellist = state.duellists[dKey];
  if (amt >= duellist.lp) {
    // all LP wiped out, duel ends
    duellist.lp = 0;
    duellist.status = DStatus.OUT_OF_LP;
  } else {
    // target has LP remaining, duel continues
    duellist.lp -= amt;
  }
};

export const heal = (state: Duel, dKey: DKey, amt: number) => {
  state.duellists[dKey].lp += amt;
};

export const getActiveEffects = (state: Duel, dKey: DKey) => {
  return state.duellists[dKey].activeEffects;
};

export const opponentIsUnderSoRL = (state: Duel, dKey: DKey) => {
  return state.duellists[dKey].activeEffects.sorlTurnsRemaining > 0;
};

export const selfUnderSoRL = (state: Duel, dKey: DKey) => {
  const otherDKey = getOtherDuellistKey(dKey);
  return state.duellists[otherDKey].activeEffects.sorlTurnsRemaining > 0;
};

export const clearConvertedZoneFlag = (state: Duel, coords: ZoneCoords) => {
  const [dKey] = coords;
  const activeEffects = getActiveEffects(state, dKey);
  activeEffects.convertedZones = activeEffects.convertedZones.filter(
    (zoneCoords) => !isCoordMatch(zoneCoords, coords)
  );
};

export const winByExodia = (state: Duel, dKey: DKey) => {
  state.duellists[dKey].status = DStatus.EXODIA;
};

export const winByFINAL = (state: Duel, dKey: DKey) => {
  state.duellists[dKey].status = DStatus.DESTINY_BOARD;
};

export const getRandomDuellable = () => {
  return duellists[Math.floor(Math.random() * duellists.length)];
};

export const getDuellable = (name: DuellableName): Duellable => {
  const duellist = duellists.find((d) => d.name === name);
  if (!duellist) {
    throw new Error(`Could not find duellist with name: ${name}`);
  }
  return duellist;
};

export const getDuellables = (): Duellable[] => {
  return duellists;
};

export const isDuellable = (name: string) => {
  try {
    getDuellable(name as DuellableName);
    return true;
  } catch {
    return false;
  }
};

export const isPlayer = (dKey: DKey) => {
  return dKey === DKey.Player;
};

export const hasMinLp = (state: Duel, dKey: DKey, amt: number) => {
  return state.duellists[dKey].lp >= amt;
};

export const setOriginTarget = (
  state: Duel,
  {
    originCoords,
    targetCoords,
  }: { originCoords?: ZoneCoords; targetCoords?: ZoneCoords }
) => {
  if (targetCoords) {
    state.activeTurn.targetCoords = targetCoords;
  }

  if (originCoords) {
    state.activeTurn.originCoords = originCoords;
  }
};

import { duellists } from "@/assets/data/duellists";
import {
  BattlePosition,
  DuellistStatus,
  Orientation,
  RowKey,
} from "../enums/duel";
import { getRandomCardId } from "./cardUtil";
import { CARD_NONE } from "./common";
import { getTempCardQuantMap, initialiseDeck } from "./deckUtil";
import { getFieldCardId, getRandomFieldCard } from "./fieldUtil";
import { updateMonsters } from "./rowUtil";
import {
  clearZone,
  generateOccupiedMonsterZone,
  getZone,
  isCoordMatch,
  specialSummon,
} from "./zoneUtil";

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
    status: DuellistStatus.HEALTHY,
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
    monsterZones: Array.from({ length: 5 }).map(() => ({ id: CARD_NONE })),
    spellTrapZones: Array.from({ length: 5 }).map(() => ({
      id: CARD_NONE,
    })),
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
    status: DuellistStatus.HEALTHY,
  };
};

export const getDuellistCoordsMap = (dKey: DuellistKey): DuellistCoordsMap => {
  const otherDKey = getOtherDuellistKey(dKey) as DuellistKey;
  return {
    dKey,
    otherDKey,

    // own rows
    ownMonsters: [dKey, RowKey.Monster],
    ownSpellTrap: [dKey, RowKey.SpellTrap],
    ownHand: [dKey, RowKey.Hand],
    ownGraveyard: [dKey, RowKey.Graveyard],

    // opponent rows
    otherMonsters: [otherDKey, RowKey.Monster],
    otherSpellTrap: [otherDKey, RowKey.SpellTrap],
    otherHand: [otherDKey, RowKey.Hand],
    otherGraveyard: [otherDKey, RowKey.Graveyard],
  };
};

export const isOwnTurn = (state: Duel, dKey: DuellistKey) => {
  return state.activeTurn.duellistKey === dKey;
};

export const isStartOfTurn = (state: Duel, dKey: DuellistKey) => {
  return state.activeTurn.isStartOfTurn && isOwnTurn(state, dKey);
};

export const getOtherDuellistKey = (dKey: DuellistKey) => {
  return isPlayer(dKey) ? "p2" : "p1";
};

export const burn = (state: Duel, dKey: DuellistKey, amt: number) => {
  if (amt >= state[dKey].lp) {
    // all LP wiped out, duel ends
    state[dKey].lp = 0;
    state[dKey].status = DuellistStatus.OUT_OF_LP;
  } else {
    // target has LP remaining, duel continues
    state[dKey].lp -= amt;
  }
};

export const heal = (state: Duel, dKey: DuellistKey, amt: number) => {
  state[dKey].lp += amt;
};

export const getActiveEffects = (state: Duel, dKey: DuellistKey) => {
  return state[dKey].activeEffects;
};

export const opponentIsUnderSoRL = (state: Duel, dKey: DuellistKey) => {
  return state[dKey].activeEffects.sorlTurnsRemaining > 0;
};

export const selfUnderSoRL = (state: Duel, dKey: DuellistKey) => {
  return state[getOtherDuellistKey(dKey)].activeEffects.sorlTurnsRemaining > 0;
};

export const clearConvertedZoneFlag = (state: Duel, coords: ZoneCoords) => {
  const [dKey] = coords;
  const activeEffects = getActiveEffects(state, dKey);
  activeEffects.convertedZones = activeEffects.convertedZones.filter(
    (zoneCoords) => !isCoordMatch(zoneCoords, coords)
  );
};

export const winByExodia = (state: Duel, dKey: DuellistKey) => {
  state[dKey].status = DuellistStatus.EXODIA;
};

export const winByFINAL = (state: Duel, dKey: DuellistKey) => {
  state[dKey].status = DuellistStatus.DESTINY_BOARD;
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

export const isPlayer = (dKey: DuellistKey) => {
  return dKey === "p1";
};

export const endTurn = (
  state: Duel,
  { dKey, otherDKey, ownMonsters }: DuellistCoordsMap
) => {
  // restore ownership of any temp-converted monsters
  const ownActiveEffects = getActiveEffects(state, dKey);
  const opponentActiveEffects = getActiveEffects(state, otherDKey);
  ownActiveEffects.convertedZones.forEach((zoneCoords) => {
    const { id, permPowerUpAtk, permPowerUpDef } = getZone(
      state,
      zoneCoords
    ) as OccupiedMonsterZone;
    specialSummon(state, otherDKey, id, {
      permPowerUpAtk,
      permPowerUpDef,
    });
    clearZone(state, zoneCoords);
  });
  ownActiveEffects.convertedZones = [];

  // decrement turns remaining for SoRL
  // Note that we check the originator/opponent's effect flag
  if (opponentActiveEffects.sorlTurnsRemaining > 0) {
    opponentActiveEffects.sorlTurnsRemaining--;
  }

  // unlock all monster zones
  updateMonsters(state, ownMonsters, (z) => {
    if (z.battlePosition === BattlePosition.Attack) {
      z.orientation = Orientation.FaceUp;
    }
    z.isLocked = false;
  });

  // reset all turn-based params
  state.activeTurn = {
    ...state.activeTurn,
    duellistKey: otherDKey,
    isStartOfTurn: true,
    hasNormalSummoned: false,
    numTributedMonsters: 0,
  };
};

import { BattlePosition, DuellistStatus, Orientation, RowKey } from "../common";
import { getCard, getRandomCardName } from "./cardUtil";
import { getTempCardQuantMap, initialiseDeck } from "./deckUtil";
import { getRandomFieldCard } from "./fieldUtil";
import { generateOccupiedMonsterZone, isCoordMatch } from "./zoneUtil";

export const randomiseDuellistState = (name: string): Duellist => {
  const rand = () => Math.random() > 0.5;
  const deck = initialiseDeck(getTempCardQuantMap());
  return {
    name,
    lp: Math.ceil(Math.random() * 8) * 1000,
    hand: deck
      .splice(0, 5)
      .map((card) => (rand() ? { isOccupied: false } : card)),
    deck: deck.slice(0, Math.floor(Math.random() * 35)),
    graveyard: [
      {
        isOccupied: true,
        card: getCard(getRandomCardName({ category: "Monster" })),
        orientation: Orientation.FaceUp,
      },
    ],
    monsterZones: Array.from({ length: 5 }).map(() =>
      rand()
        ? { isOccupied: false }
        : {
            ...generateOccupiedMonsterZone(getRandomCardName({ effect: true })),
            battlePosition: rand()
              ? BattlePosition.Attack
              : BattlePosition.Defence,
            orientation: rand() ? Orientation.FaceDown : Orientation.FaceUp,
            permPowerUpLevel: Math.floor(Math.random() * 9) - 5,
          }
    ),
    spellTrapZones: Array.from({ length: 5 }).map(() =>
      rand()
        ? { isOccupied: false }
        : {
            isOccupied: true,
            orientation: rand() ? Orientation.FaceDown : Orientation.FaceUp,
            card: getCard(
              getRandomCardName({ category: rand() ? "Trap" : "Magic" })
            ) as SpellOrTrapOrRitualCard,
          }
    ),
    activeEffects: {
      sorlTurnsRemaining: 0,
      brainControlZones: [],
    },
    fieldZone: [
      {
        isOccupied: true,
        card: getCard(getRandomFieldCard() as FieldName),
        orientation: Orientation.FaceUp,
      },
    ],
    status: DuellistStatus.HEALTHY,
  };
};

export const generateNewDuellist = (name: string): Duellist => {
  const deck = initialiseDeck(getTempCardQuantMap());
  return {
    name,
    lp: 8000,
    hand: deck.splice(0, 5).map((card) => card),
    deck: deck,
    graveyard: [{ isOccupied: false }],
    monsterZones: Array.from({ length: 5 }).map(() => ({ isOccupied: false })),
    spellTrapZones: Array.from({ length: 5 }).map(() => ({
      isOccupied: false,
    })),
    activeEffects: {
      sorlTurnsRemaining: 0,
      brainControlZones: [],
    },
    fieldZone: [{ isOccupied: false }],
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

export const getOtherDuellistKey = (key: DuellistKey) => {
  return key === "p1" ? "p2" : "p1";
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

export const removeBrainControlZone = (state: Duel, coords: ZoneCoords) => {
  const [dKey] = coords;
  const activeEffects = getActiveEffects(state, dKey);
  activeEffects.brainControlZones = activeEffects.brainControlZones.filter(
    (zoneCoords) => !isCoordMatch(zoneCoords, coords)
  );
};

export const winByExodia = (state: Duel, dKey: DuellistKey) => {
  state[dKey].status = DuellistStatus.EXODIA;
};

export const winByFINAL = (state: Duel, dKey: DuellistKey) => {
  state[dKey].status = DuellistStatus.DESTINY_BOARD;
};

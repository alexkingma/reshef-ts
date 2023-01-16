import { BattlePosition, Orientation, RowKey } from "../common";
import { getCard, getRandomCardName } from "./cardUtil";
import { initialiseDeck } from "./deckUtil";
import { generateOccupiedMonsterZone } from "./zoneUtil";

export const randomiseDuellistState = (
  name: string,
  cardMap: CardQuantityMap
): Duellist => {
  const rand = () => Math.random() > 0.5;
  const deck = initialiseDeck(cardMap);
  return {
    name,
    lp: Math.ceil(Math.random() * 8) * 1000,
    hand: deck.splice(0, 5).map((card) =>
      rand()
        ? { isOccupied: false }
        : {
            isOccupied: true,
            card,
            orientation: Orientation.FaceDown,
          }
    ),
    deck: deck.slice(0, Math.floor(Math.random() * 35)),
    graveyard: getRandomCardName({ category: "Monster" }),
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
  };
};

export const generateNewDuellist = (
  name: string,
  cardMap: CardQuantityMap
): Duellist => {
  const deck = initialiseDeck(cardMap);
  return {
    name,
    lp: 8000,
    hand: deck.splice(0, 5).map((card) => ({
      isOccupied: true,
      card,
      orientation: Orientation.FaceDown,
    })),
    deck: deck,
    graveyard: null,
    monsterZones: Array.from({ length: 5 }).map(() => ({ isOccupied: false })),
    spellTrapZones: Array.from({ length: 5 }).map(() => ({
      isOccupied: false,
    })),
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

    // opponent rows
    otherMonsters: [otherDKey, RowKey.Monster],
    otherSpellTrap: [otherDKey, RowKey.SpellTrap],
    otherHand: [otherDKey, RowKey.Hand],
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
  state[dKey].lp -= amt;
};

export const heal = (state: Duel, dKey: DuellistKey, amt: number) => {
  state[dKey].lp += amt;
};

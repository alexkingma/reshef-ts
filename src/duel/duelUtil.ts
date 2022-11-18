import cards from "../assets/cards";
import { getCardData } from "../common/deck";
import { Field, FieldRow, Orientation } from "./common";

export const getInitialDuelState = (
  cardQuantMap1: CardQuantityMap,
  cardQuantMap2: CardQuantityMap
): DuelState => {
  return {
    p1: generateNewDuellistDuelState(cardQuantMap1),
    p2: generateNewDuellistDuelState(cardQuantMap2),
    activeTurn: {
      duellistKey: "p1",
      hasNormalSummoned: false,
      numTributedMonsters: 0,
    },
    activeField: Field.Arena,
    cursorPos: [FieldRow.PlayerHand, 0],
  };
};

const getRandomCard = () => {
  return cards[Math.floor(Math.random() * cards.length)];
};

export const getTempCardQuantMap = (): CardQuantityMap => {
  const map: CardQuantityMap = {};
  let numCardsRemaining = 40;
  while (numCardsRemaining > 0) {
    const quant = Math.min(
      numCardsRemaining,
      Math.floor(Math.random() * 3) + 1
    );
    numCardsRemaining -= quant;

    // don't overwrite existing cards in the map
    let cardName;
    do {
      cardName = getRandomCard().name;
    } while (cardName in map);

    map[cardName] = quant;
  }

  return map;
};

export const generateNewDuellistDuelState = (
  cardMap: CardQuantityMap
): DuellistDuelState => {
  const deck = initialiseDeck(cardMap);
  return {
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

export const initialiseDeck = (cardQuantMap: CardQuantityMap): Deck => {
  const deck = Object.entries(cardQuantMap).reduce((deck, [cardName, qty]) => {
    const cardData = getCardData(cardName as CardName);
    const cards: Card[] = Array.from({ length: qty });
    cards.fill(cardData);
    deck.push(...cards);
    return deck;
  }, [] as Deck);
  return shuffle(deck);
};

export const shuffle = (deck: Deck): Deck => {
  let currentIdx = deck.length;
  let randomIdx;
  while (currentIdx != 0) {
    randomIdx = Math.floor(Math.random() * currentIdx--);
    [deck[currentIdx], deck[randomIdx]] = [deck[randomIdx], deck[currentIdx]];
  }
  return deck;
};

export const draw = (deck: Deck) => {
  const card = deck[0];
  if (!card) {
    throw new Error("Out of cards!");
  }
  return { card, deck: deck.slice(1) };
};

export const getFirstEmptyZoneIdx = (
  zones: (OccupiedZone | EmptyZone)[],
  defaultToFirst: boolean = true
) => {
  let nextFreeZoneIdx = zones.findIndex((zone) => !zone.isOccupied);
  if (nextFreeZoneIdx !== -1) return nextFreeZoneIdx;
  if (defaultToFirst) {
    // no free zones, return the default index
    return 0;
  } else {
    // sometimes we want to know that no zones are available, but not return a default
    throw new Error(
      "No free zones found, catch this error to implement custom logic."
    );
  }
};

export const getHighestAtkZoneIdx = (monsterZones: MonsterZone[]): number => {
  let idx = -1;
  let highestAtk = -1;
  monsterZones.forEach((zone, i) => {
    if (zone.isOccupied && zone.card.atk > highestAtk) {
      highestAtk = zone.card.atk;
      idx = i;
    }
  });
  return idx;
};

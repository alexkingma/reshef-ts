import cards from "../assets/cards";
import { getCardData } from "../common/deck";

export const getInitialDuelState = (
  cardQuantMap1: CardQuantityMap,
  cardQuantMap2: CardQuantityMap
): DuelState => {
  return {
    p1: generateNewDuellistDuelState(cardQuantMap1),
    p2: generateNewDuellistDuelState(cardQuantMap2),
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

const generateNewDuellistDuelState = (
  cardMap: CardQuantityMap
): DuellistDuelState => {
  const deck = initialiseDeck(cardMap);
  return {
    lp: 8000,
    hand: deck.splice(0, 5),
    deck: deck,
    graveyard: null,
    activeField: "Arena",
    monsterZones: [],
    spellTrapZones: [],
  };
};

export const initialiseDeck = (cardQuantMap: CardQuantityMap): Deck => {
  const deck = Object.entries(cardQuantMap).reduce((deck, [cardName, qty]) => {
    const cardData = getCardData(cardName as CardName, "Arena");
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

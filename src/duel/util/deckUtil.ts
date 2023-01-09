import { Orientation, RowKey } from "../common";
import { getCard, getRandomCardName } from "./cardUtil";
import { shuffle } from "./common";
import { getFirstEmptyZoneIdx } from "./rowUtil";

export const initialiseDeck = (cardQuantMap: CardQuantityMap): Deck => {
  const deck = Object.entries(cardQuantMap).reduce((deck, [cardName, qty]) => {
    const card = getCard(cardName as CardName);
    const cards: Card[] = Array.from({ length: qty });
    cards.fill(card);
    deck.push(...cards);
    return deck;
  }, [] as Deck);
  return shuffle(deck);
};

export const getTempCardQuantMap = (): CardQuantityMap => {
  const map: CardQuantityMap = {};
  let numCardsRemaining = 40;
  while (numCardsRemaining > 0) {
    const quant = 1;
    numCardsRemaining -= quant;

    // don't overwrite existing cards in the map
    let cardName;
    do {
      cardName = getRandomCardName({ effect: true });
    } while (cardName in map);

    map[cardName] = quant;
  }

  return map;
};

export const draw = (state: Duel, dKey: DuellistKey, numCards: number = 1) => {
  for (let i = 0; i < numCards; i++) {
    let zoneIdx: number;
    try {
      zoneIdx = getFirstEmptyZoneIdx(state, [dKey, RowKey.Hand]);
    } catch (e) {
      // no space available in hand, don't draw a card
      return;
    }

    const card = state[dKey].deck.shift();
    if (!card) {
      // TODO: player is out of cards, end game
      return;
    }

    state[dKey].hand[zoneIdx] = {
      isOccupied: true,
      card,
      orientation: Orientation.FaceDown,
    };
  }
};

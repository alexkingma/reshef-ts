import { DuellistStatus, Orientation, RowKey } from "../enums/duel";
import { getRandomCardId } from "./cardUtil";
import { shuffle } from "./common";
import { getFirstEmptyZoneIdx } from "./rowUtil";

export const initialiseDeck = (cardQuantMap: CardQuantityMap) => {
  const deck = Object.entries(cardQuantMap).reduce((deck, [idStr, qty]) => {
    const id = parseInt(idStr);
    for (let i = 0; i < qty; i++) {
      deck.push({
        id,
        orientation: Orientation.FaceDown,
      });
    }
    return deck;
  }, [] as DeckZone[]);
  return shuffle(deck);
};

export const getTempCardQuantMap = (): CardQuantityMap => {
  const map: CardQuantityMap = {};
  let numCardsRemaining = 40;
  while (numCardsRemaining > 0) {
    const quant = 1;
    numCardsRemaining -= quant;

    // don't overwrite existing cards in the map
    let id;
    do {
      id = getRandomCardId();
    } while (id in map);

    map[id] = quant;
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
      // player is out of cards, end game
      state[dKey].status = DuellistStatus.DECK_OUT;
      return;
    }

    state[dKey].hand[zoneIdx] = card;
  }
};

export const addToTopOfDeck = (state: Duel, dKey: DuellistKey, id: CardId) => {
  state[dKey].deck.unshift({
    id,
    orientation: Orientation.FaceDown,
  });
};

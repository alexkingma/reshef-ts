import { DKey, DStatus, Orientation, RowKey } from "../enums/duel";
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

export const draw = (state: Duel, dKey: DKey, numCards: number = 1) => {
  for (let i = 0; i < numCards; i++) {
    const zoneIdx = getFirstEmptyZoneIdx(state, [dKey, RowKey.Hand]);
    if (zoneIdx === -1) return; // no space in hand

    const card = state.duellists[dKey].deck.shift();
    if (!card) {
      // player is out of cards, end game
      state.duellists[dKey].status = DStatus.DECK_OUT;
      return;
    }

    state.duellists[dKey].hand[zoneIdx] = card;
  }
};

export const addToTopOfDeck = (state: Duel, dKey: DKey, id: CardId) => {
  state.duellists[dKey].deck.unshift({
    id,
    orientation: Orientation.FaceDown,
  });
};

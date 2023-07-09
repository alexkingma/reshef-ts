import { useAppSelector } from "@/hooks";
import cardEloMap from "../assets/cardElo";
import { selectDuel } from "./duelSlice";
import { getVictorKey } from "./util/duelUtil";

const cardQuantMapToDeck = (cardQuantMap: CardQuantityMap) => {
  return Object.entries(cardQuantMap).reduce((deck, [card, quant]) => {
    for (let i = 0; i < quant; i++) {
      deck.push(card as CardName);
    }
    return deck;
  }, [] as CardName[]);
};

const removeUnusedCards = (entireDeck: CardName[], unusedCards: CardName[]) => {
  // remove cards that never made it out of the deck pile, since those didn't
  // contribute to the outcome of the duel one way or another
  unusedCards.forEach((c) => {
    const idx = entireDeck.findIndex((card) => card === c);
    if (idx === -1) {
      console.log(
        "Card not found! This is probably due to a mismatch in the config deck and the working state deck.",
        c
      );
      return;
    }
    entireDeck.splice(idx, 1);
  });
  return entireDeck;
};

const getAvgCardElo = (deck: CardName[]) => {
  const totalDeckElo = deck.reduce((total, card) => {
    return total + cardEloMap[card].elo;
  }, 0);
  return totalDeckElo / deck.length;
};

const sortEloMap = (unsortedMap: typeof cardEloMap) => {
  return Object.entries(unsortedMap)
    .map(([card, data]) => {
      return {
        ...data,
        name: card,
      };
    })
    .sort((a, b) => b.elo - a.elo)
    .reduce((map, { name, ...data }) => {
      map[name as CardName] = data;
      return map;
    }, {} as typeof cardEloMap);
};

export const useElo = () => {
  // count total card elo of both decks
  // apply new elo changes to every card in each deck
  const state = useAppSelector(selectDuel);
  const p1IsWinner = getVictorKey(state) === "p1";
  const winnerCardMap = p1IsWinner ? state.config.p1Deck : state.config.p2Deck;
  const loserCardMap = p1IsWinner ? state.config.p2Deck : state.config.p1Deck;
  const winnerDeck = removeUnusedCards(
    cardQuantMapToDeck(winnerCardMap),
    (p1IsWinner ? state.p1 : state.p2).deck.map((z) => z.card.name)
  );
  const loserDeck = removeUnusedCards(
    cardQuantMapToDeck(loserCardMap),
    (p1IsWinner ? state.p2 : state.p1).deck.map((z) => z.card.name)
  );

  const calculateNewEloMap = () => {
    const winnerDeckElo = getAvgCardElo(winnerDeck);
    const loserDeckElo = getAvgCardElo(loserDeck);
    // calculate the expected odds of each deck winning, based on existing Elo
    const winningOddsOfWinner =
      1 / (1 + Math.pow(10, (loserDeckElo - winnerDeckElo) / 400));
    const winningOddsOfLoser =
      1 / (1 + Math.pow(10, (winnerDeckElo - loserDeckElo) / 400));

    // calculate how much rating will be won and lost
    // by comparing the real outcome to the expected odds
    const K_FACTOR = 32; // determines the magnitude of rating adjustments across the board
    const ratingGain = Math.round(K_FACTOR * (1 - winningOddsOfWinner));
    const ratingLoss = Math.round(K_FACTOR * (0 - winningOddsOfLoser));

    for (const card of winnerDeck) {
      cardEloMap[card].wins++;
      cardEloMap[card].elo += ratingGain;
    }

    for (const card of loserDeck) {
      cardEloMap[card].losses++;
      cardEloMap[card].elo += ratingLoss;
    }

    const sortedMap = sortEloMap(cardEloMap);
    console.log(sortedMap);
  };

  const updateEloMap = () => {
    calculateNewEloMap();
  };

  return { updateEloMap };
};

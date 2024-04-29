import { useAppSelector } from "@/hooks";
import cardEloMap from "../assets/data/cardElo.json";
import duellistEloMap from "../assets/data/duellistElo.json";
import { selectDuel } from "./duelSlice";
import { getCard } from "./util/cardUtil";
import { getVictorKey } from "./util/duelUtil";
import { getOtherDuellistKey, isDuellable } from "./util/duellistUtil";

interface EloMap {
  [key: string]: {
    wins: number;
    losses: number;
    elo: number;
  };
}

const cardQuantMapToDeck = (cardQuantMap: CardQuantityMap) => {
  return Object.entries(cardQuantMap).reduce((deck, [card, quant]) => {
    for (let i = 0; i < quant; i++) {
      deck.push(parseInt(card));
    }
    return deck;
  }, [] as CardId[]);
};

const getUsedCards = ({ deckTemplate, deck }: Duellist) => {
  // remove cards that never made it out of the deck pile, since those
  // didn't contribute to the outcome of the duel one way or another
  const unusedCards = deck.map((z) => z.card.id);
  const entireDeck = cardQuantMapToDeck(deckTemplate);

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

const getAvgCardElo = (ids: CardId[]) => {
  const totalDeckElo = ids.reduce((total, card) => {
    const { name } = getCard(card);
    return total + (cardEloMap as EloMap)[name].elo;
  }, 0);
  return totalDeckElo / ids.length;
};

const sortEloMap = (unsortedMap: EloMap) => {
  return Object.entries(unsortedMap)
    .map(([card, data]) => {
      return {
        ...data,
        name: card,
      };
    })
    .sort((a, b) => b.elo - a.elo)
    .reduce((map, { name, ...data }) => {
      map[name] = data;
      return map;
    }, {} as EloMap);
};

const getRatingDelta = (winnerElo: number, loserElo: number) => {
  // calculate the expected odds of each deck winning, based on existing Elo
  const winningOddsOfWinner =
    1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const winningOddsOfLoser =
    1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  // calculate how much rating will be won and lost
  // by comparing the real outcome to the expected odds
  const K_FACTOR = 20; // determines the magnitude of rating adjustments across the board
  return {
    ratingGain: Math.round(K_FACTOR * (1 - winningOddsOfWinner)),
    ratingLoss: Math.round(K_FACTOR * (0 - winningOddsOfLoser)),
  };
};

export const useElo = () => {
  // count total card elo of both decks
  // apply new elo changes to every card in each deck
  const state = useAppSelector(selectDuel);
  const winnerKey = getVictorKey(state);
  const loserKey = getOtherDuellistKey(winnerKey);
  const winnerDeck = getUsedCards(state[winnerKey]);
  const loserDeck = getUsedCards(state[loserKey]);

  const calculateCardEloMap = () => {
    const { ratingGain, ratingLoss } = getRatingDelta(
      getAvgCardElo(winnerDeck),
      getAvgCardElo(loserDeck)
    );

    for (const card of winnerDeck) {
      const { name } = getCard(card);
      (cardEloMap as EloMap)[name].wins++;
      (cardEloMap as EloMap)[name].elo += ratingGain;
    }

    for (const card of loserDeck) {
      const { name } = getCard(card);
      (cardEloMap as EloMap)[name].losses++;
      (cardEloMap as EloMap)[name].elo += ratingLoss;
    }

    return sortEloMap(cardEloMap);
  };

  const calculateDuellistEloMap = () => {
    const winnerName = state[winnerKey].name as DuellableName;
    const loserName = state[loserKey].name as DuellableName;
    const winnerElo = duellistEloMap[winnerName].elo;
    const loserElo = duellistEloMap[loserName].elo;

    const { ratingGain, ratingLoss } = getRatingDelta(winnerElo, loserElo);

    duellistEloMap[winnerName].wins++;
    duellistEloMap[winnerName].elo += ratingGain;

    duellistEloMap[loserName].losses++;
    duellistEloMap[loserName].elo += ratingLoss;

    return sortEloMap(duellistEloMap);
  };

  const updateEloMap = () => {
    if ([state.p1.name, state.p2.name].every((n) => !isDuellable(n))) {
      // two unnamed cardQuantMaps measures individual card Elo
      const newCardEloMap = calculateCardEloMap();
      console.log(newCardEloMap); // TODO: write to file
    } else if ([state.p1.name, state.p2.name].every(isDuellable)) {
      // two dedicated duellist decks measures duellist Elo
      const newDuellistEloMap = calculateDuellistEloMap();
      console.log(newDuellistEloMap); // TODO: write to file
    }
  };

  return { updateEloMap };
};

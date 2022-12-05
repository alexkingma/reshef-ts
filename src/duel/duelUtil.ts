import cards from "../assets/cards";
import { getCard } from "../common/card";
import { BattlePosition, Field, FieldRow, Orientation } from "./common";

export const getInitialDuel = (
  cardQuantMap1: CardQuantityMap,
  cardQuantMap2: CardQuantityMap
): Duel => {
  return {
    p1: generateNewDuellist(cardQuantMap1),
    p2: generateNewDuellist(cardQuantMap2),
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

export const generateNewDuellist = (cardMap: CardQuantityMap): Duellist => {
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
    const cardData = getCard(cardName as CardName);
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

export const getFirstEmptyZoneIdx = (
  zones: Zone[],
  defaultToFirst: boolean = false
) => {
  let nextFreeZoneIdx = zones.findIndex((zone) => !zone.isOccupied);
  if (nextFreeZoneIdx !== -1) return nextFreeZoneIdx as FieldCol;
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

export const getHighestAtkZoneIdx = (monsterZones: MonsterZone[]) => {
  let idx = -1;
  let highestAtk = -1;
  monsterZones.forEach((zone, i) => {
    if (zone.isOccupied && zone.card.atk > highestAtk) {
      highestAtk = zone.card.atk;
      idx = i;
    }
  });
  return idx as FieldCol | -1;
};

export const getOtherDuellistKey = (key: DuellistKey) => {
  return key === "p1" ? "p2" : "p1";
};

export const getNumTributesRequired = ({
  level,
}: MonsterCard): 0 | 1 | 2 | 3 => {
  return level >= 9 ? 3 : level >= 7 ? 2 : level >= 5 ? 1 : 0;
};

export const getZoneKey = (
  row: FieldRow
): keyof Pick<Duellist, "monsterZones" | "spellTrapZones" | "hand"> => {
  switch (row) {
    case FieldRow.PlayerMonster:
    case FieldRow.OpponentMonster:
      return "monsterZones";
    case FieldRow.PlayerSpellTrap:
    case FieldRow.OpponentSpellTrap:
      return "spellTrapZones";
    default:
      return "hand";
  }
};

export const getNumCardsInHand = (hand: HandZone[]) => {
  return hand.filter((z) => z.isOccupied).length;
};

export const clearGraveyard = (duellist: Duellist) => {
  duellist.graveyard = null;
};

export const clearZone = (row: Zone[], idx: number) => {
  // does NOT send anything to graveyard
  row[idx] = { isOccupied: false };
};

const setRowOrientation = (row: Zone[], orientation: Orientation) => {
  row.forEach((zone, idx, row) => {
    if (!zone.isOccupied) return;
    (row[idx] as OccupiedZone).orientation = orientation;
  });
};

export const setRowFaceUp = (row: Zone[]) => {
  setRowOrientation(row, Orientation.FaceUp);
};

export const setRowFaceDown = (row: Zone[]) => {
  setRowOrientation(row, Orientation.FaceDown);
};

export const containsCard = (row: Zone[], cardName: CardName) => {
  return !!row.find((r) => r.isOccupied && r.card.name === cardName);
};

export const getOccupiedMonsterZone = (
  card: MonsterCard
): OccupiedMonsterZone => ({
  // use this to avoid boilerplate elsewhere
  isOccupied: true,
  card,
  battlePosition: BattlePosition.Attack,
  orientation: Orientation.FaceUp,
  hasAttacked: false,
  powerUpLevel: 0,
});

import { getCardData, getNumTributes, NumTributes } from "./deck";

type DeckTributeAtkDefMap = {
  [key in NumTributes]: { min: number; max: number };
};

const DEF_MULTIPLIER = 0.8; // DEF is less threatening than ATK

const getTributeThreatMultiplier = (card: MonsterCard) => {
  const TRIBUTE_THREAT_MULTIPLIER_MAP = {
    // 0-tribute monsters are more threat-relevant than 1/2/3-tribute monsters
    0: 1,
    1: 0.8,
    2: 0.6,
    3: 0.5,
  };
  const numTributes = getNumTributes(card);
  return TRIBUTE_THREAT_MULTIPLIER_MAP[numTributes];
};

export const getDeckTributeAtkDefMap = (deck: Deck, field: Field) => {
  // compute max/min atkDef for each tribute tier in a deck
  return Object.keys(deck).reduce((map, cardName) => {
    const cardData = getCardData(cardName as CardName, field);
    if (cardData.category !== "Monster") return map;
    const atkDef = Math.max(cardData.atk, cardData.def * DEF_MULTIPLIER);
    const numTributes = getNumTributes(cardData);
    map[numTributes] = {
      max: Math.max(map[numTributes]?.max || 0, atkDef),
      min: Math.min(map[numTributes]?.min || Number.MAX_SAFE_INTEGER, atkDef),
    };
    return map;
  }, {} as DeckTributeAtkDefMap);
};

export const getAlignmentThreatMap = (deckCards: DeckCard[]) => {
  const alignmentThreatMap = deckCards.reduce(
    (map, deckCard) => {
      if (deckCard.category !== "Monster") return map;
      map[deckCard.alignment] += deckCard.threat;
      return map;
    },
    {
      Fiend: 0,
      Earth: 0,
      Forest: 0,
      Water: 0,
      Dark: 0,
      Light: 0,
      Wind: 0,
      Fire: 0,
      Dreams: 0,
      Divine: 0,
      Thunder: 0,
    }
  );

  // sort alignments by threat level; remove 0-threats
  return Object.entries(alignmentThreatMap)
    .sort(([, a], [, b]) => b - a)
    .filter(([, threat]) => threat)
    .reduce(
      (map, [alignment, threat]) => ({ ...map, [alignment]: threat }),
      {}
    );
};

export const getCardThreat = (
  card: Card,
  deckMinAtkDef: number,
  deckMaxAtkDef: number
) => {
  if (card.category !== "Monster") return -1;
  const atkDef = Math.max(card.atk, card.def * DEF_MULTIPLIER);
  const relativeMultiplier =
    0.5 + (atkDef - deckMinAtkDef) / (deckMaxAtkDef - deckMinAtkDef + 1);
  return atkDef * relativeMultiplier * getTributeThreatMultiplier(card);
};

export const getCardThreatMap = (deck: Deck, field: Field) => {
  let totalDeckThreat = 0;
  const tributeAtkDefRange = getDeckTributeAtkDefMap(deck, field);
  const cardThreatMap = Object.entries(deck).reduce((map, [cardName, qty]) => {
    const card = getCardData(cardName as CardName, field);
    if (card.category !== "Monster") return map;
    const { max, min } = tributeAtkDefRange[getNumTributes(card)];
    const cardThreat = getCardThreat(card, min, max) * qty;
    map[card.name] = cardThreat;
    totalDeckThreat += cardThreat;
    return map;
  }, {} as { [cardName in CardName]?: number });

  // normalise threat scores as a percentage of deck total threat
  Object.entries(cardThreatMap).map(([cardName, rawThreat]) => {
    cardThreatMap[cardName as CardName] = Math.round(
      (rawThreat / totalDeckThreat) * 100
    );
  });

  return cardThreatMap;
};

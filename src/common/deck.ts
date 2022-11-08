import cards from "../assets/cards";
import { default as fields } from "../assets/fields.json";
import { getCardThreatMap } from "./threat";

export type NumTributes = 0 | 1 | 2 | 3;

export const getFieldMultipliers = (field: Field) => {
  return fields[field] as { [key in CardType]: number };
};

export const getCardData = (cardName: CardName, field: Field): Card => {
  const card = { ...cards.find((c) => c.name === cardName)! };
  if (card.category === "Monster") {
    const fieldBuffMap = getFieldMultipliers(field);
    card.atk = Math.floor(card.atk * (fieldBuffMap[card.type] || 1));
    card.def = Math.floor(card.def * (fieldBuffMap[card.type] || 1));
  }
  return card;
};

export const getDeckCapacity = (deck: Deck) => {
  let rawDC = 0;
  let effectiveDC = 0;
  let count999 = 0;
  Object.entries(deck).forEach(([cardName, quant]) => {
    const baseCost = getCardData(cardName as CardName, "Arena").cost;
    rawDC += baseCost * quant;
    if (baseCost === 999) {
      count999++;
      return;
    }
    effectiveDC += baseCost * quant;
  });
  return { effectiveDC, rawDC, count999 };
};

export const getDeckCapacityString = (deck: Deck) => {
  const { effectiveDC, rawDC } = getDeckCapacity(deck);
  if (effectiveDC === rawDC) return rawDC.toLocaleString();
  return `${effectiveDC.toLocaleString()} (${rawDC.toLocaleString()})`;
};

export const getAverageCardCost = (deck: Deck) => {
  const { effectiveDC, rawDC, count999 } = getDeckCapacity(deck);
  const numCards = Object.values(deck).reduce((sum, qty) => sum + qty, 0);
  return {
    effectiveAvg: Math.round(effectiveDC / (numCards - count999)),
    rawAvg: Math.round(rawDC / numCards),
  };
};

export const getAverageAnteCost = (cardNames: CardName[]) => {
  const tempDeck = cardNames.reduce(
    (deck, cardName: CardName) => ({ ...deck, [cardName]: 1 }),
    {} as Deck
  );
  return getAverageCardCost(tempDeck);
};

export const getNumTributes = ({ level }: MonsterCard): NumTributes => {
  return level >= 9 ? 3 : level >= 7 ? 2 : level >= 5 ? 1 : 0;
};

export const sortDeck = (a: Card, b: Card): number => {
  if (a.category !== b.category) {
    const catOrder: CardCategory[] = ["Monster", "Magic", "Trap", "Ritual"];
    const idxA = catOrder.findIndex((cat) => cat === a.category);
    const idxB = catOrder.findIndex((cat) => cat === b.category);
    return idxA - idxB;
  }
  if (a.category !== "Monster" || b.category !== "Monster") {
    return a.cost - b.cost;
  }
  const atkDefA = Math.max(a.atk, a.def);
  const atkDefB = Math.max(b.atk, b.def);
  return atkDefA - atkDefB || a.atk - b.atk || a.def - b.def;
};

export const getDeckCards = (deck: Deck, field: Field): DeckCard[] => {
  const cardThreatMap = getCardThreatMap(deck, field);
  return Object.entries(deck)
    .map(([cardName, qty]: [string, number]) => {
      const card = getCardData(cardName as CardName, field);
      const threat = cardThreatMap[cardName as CardName]!;
      return { qty, threat, ...card };
    })
    .sort(sortDeck);
};

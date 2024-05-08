import { default as alignmentMap } from "@/assets/data/alignment.json";
import cards from "@/assets/data/cards";
import { Monster } from "../enums/monster";
import { Spell, Trap } from "../enums/spellTrapRitual";

// Create a lookup map at runtime to avoid doing [].find()
// every time card data needs to be fetched (100s of times per duel).
// Measured to be on average 6-10x faster than array lookup, and
// will scale better as new cards are added.
const CARD_MAP: Record<CardId, Card> = cards.reduce((map, dbCard) => {
  return {
    ...map,
    [dbCard.id]: dbCard,
  };
}, {});

export const getCard = (id: CardId): Card => {
  const card = CARD_MAP[id];
  if (!card) {
    throw new Error(`Unknown card id: ${id}`);
  }
  return card;
};

export const isCardMatch = (card: Card, cardRules: Partial<Card> = {}) => {
  return Object.entries(cardRules).every(
    ([key, val]) => card[key as keyof Card] === val
  );
};

export const getRandomCardId = (cardRules: Partial<Card> = {}): CardId => {
  let card;
  do {
    card = getCard(Math.floor(Math.random() * cards.length + 1));
  } while (!isCardMatch(card, cardRules));
  return card.id;
};

export const getExodiaCards = () => {
  return [
    Monster.ExodiaTheForbiddenOne,
    Monster.LeftArmOfTheForbiddenOne,
    Monster.LeftLegOfTheForbiddenOne,
    Monster.RightArmOfTheForbiddenOne,
    Monster.RightLegOfTheForbiddenOne,
  ];
};

export const getFinalCards = () => {
  return [
    Trap.DestinyBoard,
    Trap.SpiritMessageI,
    Trap.SpiritMessageN,
    Trap.SpiritMessageA,
    Trap.SpiritMessageL,
  ];
};

export const getHealSpells = () => {
  return [
    Spell.MooyanCurry,
    Spell.RedMedicine,
    Spell.GoblinsSecretRemedy,
    Spell.SoulOfThePure,
    Spell.DianKetoTheCureMaster,
  ];
};

export const getBurnSpells = () => {
  return [
    Spell.Sparks,
    Spell.Hinotama,
    Spell.FinalFlame,
    Spell.Ookazi,
    Spell.TremendousFire,
    Spell.RestructerRevolution,
  ];
};

export const getNumTributesRequired = ({
  level,
}: MonsterCard): 0 | 1 | 2 | 3 => {
  return level >= 9 ? 3 : level >= 7 ? 2 : level >= 5 ? 1 : 0;
};

export const getAlignmentResult = (attacker: Alignment, target: Alignment) => {
  const { strong, weak } = alignmentMap[attacker];
  return { isStrong: strong === target, isWeak: weak === target };
};

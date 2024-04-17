import { default as alignmentMap } from "@/assets/alignment.json";
import cards from "@/assets/cards";
import { Monster, Spell, Trap } from "../common";

// Create a lookup map at runtime to avoid doing [].find()
// every time card data needs to be fetched (100s of times per duel).
// Measured to be on average 6-10x faster than array lookup, and
// will scale better as new cards are added.
const CARD_MAP = cards.reduce(
  (map, dbCard) => {
    return {
      ...map,
      [dbCard.name]: dbCard,
    };
  },
  {} as { [key in CardName]: DBCard }
);

export const getCard = <T extends CardName>(cardName: T): Card<T> => {
  const dbCard = CARD_MAP[cardName];
  if (dbCard.category !== "Monster") {
    return dbCard;
  }

  return {
    ...dbCard,
    effAtk: dbCard.atk,
    effDef: dbCard.def,
  } as Card<T>;
};

export const isCardMatch = (card: Card, cardRules: Partial<Card> = {}) => {
  return Object.entries(cardRules).every(
    ([key, val]) => card[key as keyof Card] === val
  );
};

export const getRandomCardName = (cardRules: Partial<Card> = {}): CardName => {
  let dbCard;
  do {
    dbCard = cards[Math.floor(Math.random() * cards.length)];
  } while (!isCardMatch(getCard(dbCard.name), cardRules));
  return dbCard.name;
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

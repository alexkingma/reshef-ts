import cards from "@/assets/cards";
import { default as alignmentMap } from "../../assets/alignment.json";
import { default as fieldMultiplierMap } from "../../assets/fields.json";
import { Field, Monster, Spell } from "../common";

export const getCard = <T extends CardName>(cardName: T): Card<T> => {
  const dbCard = cards.find((c) => c.name === cardName)!;
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

export const getFieldMultiplier = (field: Field, type: CardType) => {
  const map = fieldMultiplierMap[field] as { [key in CardType]: number };
  return map[type] || 1;
};

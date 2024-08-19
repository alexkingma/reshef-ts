import { default as alignmentMap } from "@/assets/data/alignment.json";
import cards from "@/assets/data/cards";
import { Monster } from "../enums/monster";
import { Spell, Trap } from "../enums/spellTrapRitual";

export const getCard = (id: CardId): Card => {
  const card = cards[id - 1]; // id starts at 1
  if (!card) {
    throw new Error(`No card with id: ${id}`);
  } else if (id !== card.id) {
    throw new Error(
      `Wanted card with id ${id}, but got card with id ${card.id}`
    );
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

export const getNumTributesRequired = ({ level }: MonsterCard) => {
  return level >= 9 ? 3 : level >= 7 ? 2 : level >= 5 ? 1 : 0;
};

export const getAlignmentResult = (attacker: Alignment, target: Alignment) => {
  const { strong, weak } = alignmentMap[attacker];
  return { isStrong: strong === target, isWeak: weak === target };
};

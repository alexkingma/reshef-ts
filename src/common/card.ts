import cards from "../assets/cards";

export const getCard = (cardName: CardName): Card => {
  return { ...cards.find((c) => c.name === cardName)! };
};

export const getRandomCard = (): Card => {
  return {
    ...cards.find(
      (c, idx) => idx === Math.floor(Math.random() * cards.length)
    )!,
  };
};

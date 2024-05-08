export const shuffle = <T extends any[]>(arr: T): T => {
  let currentIdx = arr.length;
  let randomIdx;
  while (currentIdx != 0) {
    randomIdx = Math.floor(Math.random() * currentIdx--);
    [arr[currentIdx], arr[randomIdx]] = [arr[randomIdx], arr[currentIdx]];
  }
  return arr;
};

export const always = () => true;
export const never = () => false;

export const CARD_NONE = 0;

// TODO: enum
export const COLOR_SPELL = "#39A24E";
export const COLOR_TRAP = "#AC4E8D";
export const COLOR_EFFECT_MONSTER = "#D45420";

export const getColor = (category: CardCategory) => {
  switch (category) {
    case "Magic":
      return COLOR_SPELL;
    case "Trap":
      return COLOR_TRAP;
    case "Monster":
      return COLOR_EFFECT_MONSTER;
    default:
      console.error(`Unknown card category: ${category}`);
      return "#000000";
  }
};

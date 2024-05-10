export const always = () => true;
export const never = () => false;

export const CARD_NONE = 0;

export const shuffle = <T extends any[]>(arr: T): T => {
  let currentIdx = arr.length;
  let randomIdx;
  while (currentIdx != 0) {
    randomIdx = Math.floor(Math.random() * currentIdx--);
    [arr[currentIdx], arr[randomIdx]] = [arr[randomIdx], arr[currentIdx]];
  }
  return arr;
};

type Map = Record<number | string, any | any[]>;
export const mergeMapsAndValues = (obj1: Map, obj2: Map) => {
  const res: Map = { ...obj1 };
  for (const key in obj2) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (!res.hasOwnProperty(key)) {
      // no duplicate keys
      res[key] = val2;
      continue;
    }

    // merge multiple vals into one array per key
    if (Array.isArray(val1) && Array.isArray(val2)) {
      res[key] = [...val1, ...val2];
    } else if (Array.isArray(val1)) {
      res[key] = [...val1, val2];
    } else if (Array.isArray(val2)) {
      res[key] = [val1, ...val2];
    } else {
      res[key] = [val1, val2];
    }
  }
  return res;
};

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

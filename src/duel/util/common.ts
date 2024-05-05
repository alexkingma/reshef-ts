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

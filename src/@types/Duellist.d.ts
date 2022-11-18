interface Duellist {
  name: string;
  deck: CardQuantityMap;
  lp: number;
  location: string;
  payout: number;
  dc: 0 | 1 | 3 | 10 | 20;
  field: Field;
  ante: CardName[];
  inRoute: boolean;
}

type CardQuantityMap = {
  [card in CardName]?: number;
};

type DeckCard = Card & {
  qty: number;
  threat: number;
};

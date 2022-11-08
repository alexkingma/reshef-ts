interface Duellist {
  name: string;
  deck: CardQuantityMap;
  lp: number;
  location: string;
  payout: number;
  field: Field;
  ante: CardName[];
  inRoute: boolean;
}

type Field = keyof typeof import("../assets/fields.json");

type CardQuantityMap = {
  [card in CardName]?: number;
};

type DeckCard = Card & {
  qty: number;
  threat: number;
};

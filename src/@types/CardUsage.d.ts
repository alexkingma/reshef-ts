type CardCondition = (state: Duel, coordsMap: ZoneCoordsMap) => boolean;
type CardEffect = (state: Duel, coordsMap: ZoneCoordsMap) => void;

type DirectEffectReducer = {
  effect: CardEffect;
  text: string;
  noDiscard?: boolean; // spellTrap only
};

type AutoEffectReducer = DirectEffectReducer & {
  row: string; // uses RowKey enum
  condition: CardCondition;
};

type CardEffectMap<T extends DirectEffectReducer> = Record<CardId, T | T[]>;

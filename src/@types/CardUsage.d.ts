type CardCondition = (state: Duel, coordsMap: ZoneCoordsMap) => boolean;
type CardEffect = (state: Duel, coords: ZoneCoordsMap) => void;

interface ConditionalEffect {
  condition: CardCondition;
  effect: CardEffect;
}

type EffConReducer = (state: Duel, coords: ZoneCoordsMap) => ConditionalEffect;
type MultiEffConReducer = (
  state: Duel,
  coords: ZoneCoordsMap
) => ConditionalEffect[];
type DirectEffectReducer = CardEffect;

type CardReducerMap<
  K extends CardId,
  V extends
    | EffConReducer
    | MultiEffConReducer
    | DirectEffectReducer
    | CardCondition,
> = {
  [key in K]: V;
};

interface ConditionalEffect {
  condition: () => boolean;
  effect: (state: Duel, coords: ZoneCoordsMap) => void;
}

type EffConReducer = (state: Duel, coords: ZoneCoordsMap) => ConditionalEffect;
type MultiEffConReducer = (
  state: Duel,
  coords: ZoneCoordsMap
) => ConditionalEffect[];
type DirectEffectReducer = (state: Duel, coords: ZoneCoordsMap) => void;

type CardReducerMap<
  K extends CardName,
  V extends EffConReducer | MultiEffConReducer | DirectEffectReducer
> = {
  [key in K]: V;
};

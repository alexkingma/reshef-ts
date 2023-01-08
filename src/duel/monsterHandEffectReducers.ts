import { clearZone, destroyFirstFound, specialSummon } from "./cardEffectUtil";
import { HandEffectMonster, Monster } from "./common";
import { ZoneCoordsMap } from "./duelSlice";
import { countMatchesInRow, isStartOfEitherTurn } from "./duelUtil";

type MonsterAutoEffectReducer = (
  state: Duel,
  coords: ZoneCoordsMap
) => {
  condition: () => boolean;
  effect: (state: Duel, coords: ZoneCoordsMap) => void;
}[];

type MonsterAutoEffectReducers = {
  [key in HandEffectMonster]: MonsterAutoEffectReducer;
};

export const monsterHandEffectReducers: MonsterAutoEffectReducers = {
  [Monster.LavaGolem]: (state, { otherMonsters }) => {
    return [
      {
        condition: () => {
          return (
            isStartOfEitherTurn(state) &&
            countMatchesInRow(state, otherMonsters) >= 2
          );
        },
        effect: (state, { zoneCoords, otherDKey, otherMonsters }) => {
          // If this is in the own hand, it can be made to appear on
          // the enemy's field for two enemy monsters as tributes.
          destroyFirstFound(state, otherMonsters);
          destroyFirstFound(state, otherMonsters);
          specialSummon(state, otherDKey, Monster.LavaGolem);
          clearZone(state, zoneCoords);
        },
      },
    ];
  },
};

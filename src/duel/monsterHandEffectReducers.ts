import { clearZone, destroyAtCoords, specialSummon } from "./cardEffectUtil";
import { HandEffectMonster, Monster } from "./common";
import { StateMap, ZoneCoordsMap } from "./duelSlice";
import { countMatchesInRow } from "./duelUtil";

type MonsterAutoEffectReducer = (
  state: StateMap,
  coords: ZoneCoordsMap
) => {
  condition: () => boolean;
  effect: (state: StateMap, coords: ZoneCoordsMap) => void;
}[];

type MonsterAutoEffectReducers = {
  [key in HandEffectMonster]: MonsterAutoEffectReducer;
};

export const monsterHandEffectReducers: MonsterAutoEffectReducers = {
  [Monster.LavaGolem]: ({ state }, { otherMonsters, zoneCoords, dKey }) => {
    return [
      {
        condition: () => {
          // TODO -- start of turn
          return countMatchesInRow(state, otherMonsters) >= 2;
        },
        effect: () => {
          // If this is in the own hand, it can be made to appear on
          // the enemy's field for two enemy monsters as tributes.

          // TODO: make sure the firstZoneIdx is different each time when called twice
          destroyAtCoords(state, zoneCoords);
          destroyAtCoords(state, zoneCoords);
          specialSummon(state, dKey, Monster.LavaGolem);
          clearZone(state, zoneCoords);
        },
      },
    ];
  },
};

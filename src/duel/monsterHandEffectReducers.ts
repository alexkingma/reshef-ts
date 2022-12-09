import { clearZone, destroyAtCoords, specialSummon } from "./cardEffectUtil";
import { HandEffectMonster, Monster, RowKey } from "./common";
import { MonsterAutoEffectReducer } from "./coreDuelReducers";
import { countMatchesInRow, getFirstOccupiedZoneIdx } from "./duelUtil";

type MonsterAutoEffectReducers = {
  [key in HandEffectMonster]: MonsterAutoEffectReducer;
};

export const monsterHandEffectReducers: MonsterAutoEffectReducers = {
  [Monster.LavaGolem]: ({ originatorState, targetState }, monsterIdx) => {
    return [
      {
        condition: () => {
          // TODO -- start of turn
          return countMatchesInRow(targetState.monsterZones) >= 2;
        },
        effect: () => {
          // If this is in the own hand, it can be made to appear on
          // the enemy's field for two enemy monsters as tributes.

          // TODO: make sure the firstZoneIdx is different each time when called twice
          destroyAtCoords(targetState, [
            RowKey.Monster,
            getFirstOccupiedZoneIdx(targetState.monsterZones) as FieldCol,
          ]);
          destroyAtCoords(targetState, [
            RowKey.Monster,
            getFirstOccupiedZoneIdx(targetState.monsterZones) as FieldCol,
          ]);
          specialSummon(targetState, Monster.LavaGolem);
          clearZone(originatorState.hand, monsterIdx);
        },
      },
    ];
  },
};

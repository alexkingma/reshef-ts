import {
  clearGraveyard,
  destroyAtCoords,
  destroyHighestAtk,
  resurrectOwn,
  specialSummon,
} from "./cardEffectUtil";
import { GraveyardEffectMonster, Monster, RowKey } from "./common";
import { MonsterAutoEffectReducer } from "./coreDuelReducers";
import {
  countMatchesInRow,
  getFirstOccupiedZoneIdx,
  hasEmptyZone,
} from "./duelUtil";

type MonsterGraveyardEffectReducers = {
  [key in GraveyardEffectMonster]: MonsterAutoEffectReducer;
};

export const monsterGraveyardEffectReducers: MonsterGraveyardEffectReducers = {
  [Monster.TheWingedDragonOfRaPhoenixMode]: ({ originatorState }) => {
    return [
      {
        condition: () => {
          return hasEmptyZone(originatorState.monsterZones);
        },
        effect: ({ originatorState }) => {
          specialSummon(originatorState, Monster.TheWingedDragonOfRaBattleMode);
          clearGraveyard(originatorState);
        },
      },
    ];
  },
  [Monster.Helpoemer]: ({ targetState }) => {
    return [
      {
        condition: () => {
          // TODO: start of foe's turn (verify)
          return countMatchesInRow(targetState.hand) >= 3;
        },
        effect: ({ targetState }) => {
          // If this is in the own graveyard on the enemy's turn, and if
          // the foe has 3 or more cards in hand, the foe must discard one.
          const handIdx = getFirstOccupiedZoneIdx(targetState.hand) as FieldCol;
          destroyAtCoords(targetState, [RowKey.Hand, handIdx]);
        },
      },
    ];
  },
  [Monster.Newdoria]: ({ targetState }) => {
    return [
      {
        condition: () => {
          return countMatchesInRow(targetState.monsterZones) > 0;
        },
        effect: ({ originatorState, targetState }) => {
          destroyHighestAtk(targetState);
          clearGraveyard(originatorState);
        },
      },
    ];
  },
  [Monster.VampireLord]: ({ originatorState }) => {
    return [
      {
        condition: () => {
          return hasEmptyZone(originatorState.monsterZones);
        },
        effect: ({ originatorState }) => {
          // in the own graveyard at the start of your turn == resurrected
          resurrectOwn(originatorState);
        },
      },
    ];
  },
  [Monster.DifferentDimensionDragon]: ({ originatorState }) => {
    return [
      {
        condition: () => {
          return hasEmptyZone(originatorState.monsterZones);
        },
        effect: ({ originatorState }) => {
          // in the own graveyard at the start of your turn == resurrected
          resurrectOwn(originatorState);
        },
      },
    ];
  },
  [Monster.DarkFlareKnight]: ({ originatorState }) => {
    return [
      {
        condition: () => {
          return hasEmptyZone(originatorState.monsterZones);
        },
        effect: ({ originatorState }) => {
          specialSummon(originatorState, Monster.MirageKnight);
          clearGraveyard(originatorState);
        },
      },
    ];
  },
};

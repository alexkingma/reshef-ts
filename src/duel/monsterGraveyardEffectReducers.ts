import {
  clearGraveyard,
  destroyFirstFound,
  destroyHighestAtk,
  resurrectOwn,
  specialSummon,
} from "./cardEffectUtil";
import { GraveyardEffectMonster, Monster } from "./common";
import { DuellistCoordsMap } from "./duelSlice";
import { countMatchesInRow, hasEmptyZone, isStartOfTurn } from "./duelUtil";

type GraveyardEffectReducer = (
  state: Duel,
  coordsMap: DuellistCoordsMap
) => void;

type MonsterGraveyardEffectReducers = {
  [key in GraveyardEffectMonster]: (
    state: Duel,
    coordsMap: DuellistCoordsMap
  ) => {
    condition: () => boolean;
    effect: GraveyardEffectReducer;
  }[];
};

export const monsterGraveyardEffectReducers: MonsterGraveyardEffectReducers = {
  [Monster.TheWingedDragonOfRaPhoenixMode]: (state, { ownMonsters }) => {
    return [
      {
        condition: () => {
          return hasEmptyZone(state, ownMonsters);
        },
        effect: (state, { dKey }) => {
          clearGraveyard(state, dKey);
          specialSummon(state, dKey, Monster.TheWingedDragonOfRaBattleMode);
        },
      },
    ];
  },
  [Monster.Helpoemer]: (state, { otherDKey, otherHand }) => {
    return [
      {
        condition: () => {
          return (
            isStartOfTurn(state, otherDKey) &&
            countMatchesInRow(state, otherHand) >= 3
          );
        },
        effect: (state, { otherHand }) => {
          // If this is in the own graveyard on the enemy's turn, and if
          // the foe has 3 or more cards in hand, the foe must discard one.
          destroyFirstFound(state, otherHand);
        },
      },
    ];
  },
  [Monster.Newdoria]: (state, { otherMonsters, dKey }) => {
    return [
      {
        condition: () => {
          return (
            isStartOfTurn(state, dKey) &&
            countMatchesInRow(state, otherMonsters) > 0
          );
        },
        effect: (state, { dKey, otherDKey }) => {
          destroyHighestAtk(state, otherDKey);
          clearGraveyard(state, dKey);
        },
      },
    ];
  },
  [Monster.VampireLord]: (state, { dKey, ownMonsters }) => {
    return [
      {
        condition: () => {
          return isStartOfTurn(state, dKey) && hasEmptyZone(state, ownMonsters);
        },
        effect: (state, { dKey }) => {
          resurrectOwn(state, dKey);
        },
      },
    ];
  },
  [Monster.DifferentDimensionDragon]: (state, { dKey, ownMonsters }) => {
    return [
      {
        condition: () => {
          return isStartOfTurn(state, dKey) && hasEmptyZone(state, ownMonsters);
        },
        effect: (state, { dKey }) => {
          resurrectOwn(state, dKey);
        },
      },
    ];
  },
  [Monster.DarkFlareKnight]: (state, { ownMonsters }) => {
    return [
      {
        condition: () => {
          return hasEmptyZone(state, ownMonsters);
        },
        effect: (state, { dKey }) => {
          clearGraveyard(state, dKey);
          specialSummon(state, dKey, Monster.MirageKnight);
        },
      },
    ];
  },
};

import { HandEffectMonster, Monster } from "../common";
import { isStartOfEitherTurn } from "../util/duelUtil";
import {
  countMatchesInRow,
  destroyFirstFound,
  hasFullExodia,
} from "../util/rowUtil";
import { clearZone, specialSummon } from "../util/zoneUtil";

export const monsterHandEffectReducers: CardReducerMap<
  HandEffectMonster,
  MultiEffConReducer
> = {
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
  [Monster.ExodiaTheForbiddenOne]: (state, { ownHand }) => {
    return [
      {
        condition: () => {
          return hasFullExodia(state, ownHand);
        },
        effect: (state, { dKey }) => {
          // TODO: set victory flag
        },
      },
    ];
  },
};

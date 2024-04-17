import { HandEffectCard, Monster } from "../common";
import { isStartOfEitherTurn } from "../util/duelUtil";
import { winByExodia } from "../util/duellistUtil";
import {
  countMatchesInRow,
  destroyFirstFound,
  hasFullExodia,
} from "../util/rowUtil";
import { clearZone, isNotGodCard, specialSummon } from "../util/zoneUtil";

export const handEffects: CardReducerMap<HandEffectCard, MultiEffConReducer> = {
  [Monster.LavaGolem]: (state, { otherMonsters }) => {
    return [
      {
        condition: () => {
          return (
            isStartOfEitherTurn(state) &&
            countMatchesInRow(state, otherMonsters, isNotGodCard) >= 2
          );
        },
        effect: (state, { zoneCoords, otherDKey, otherMonsters }) => {
          // If this is in the own hand, it can be made to appear on
          // the enemy's field for two enemy monsters as tributes.
          destroyFirstFound(state, otherMonsters, isNotGodCard);
          destroyFirstFound(state, otherMonsters, isNotGodCard);
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
          winByExodia(state, dKey);
        },
      },
    ];
  },
};

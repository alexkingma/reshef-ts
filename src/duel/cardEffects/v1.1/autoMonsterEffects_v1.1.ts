import { BattlePosition, Monster } from "@/duel/common";
import { isZombie } from "@/duel/util/cardTypeUtil";
import { isStartOfTurn } from "@/duel/util/duellistUtil";
import { clearGraveyard } from "@/duel/util/graveyardUtil";
import {
  countMatchesInRow,
  hasMatchInRow,
  setRowFaceUp,
  updateMonsters,
} from "@/duel/util/rowUtil";
import { getZone, isFaceDown, permPowerUp } from "@/duel/util/zoneUtil";

export const autoMonsterEffects: CardSubsetReducerMap<
  Monster,
  MultiEffConReducer
> = {
  [Monster.GearfriedTheIronKnight]: (state, { zoneCoords }) => {
    return [
      {
        condition: () => {
          // TODO: activate effect even if atk/def isn't going below 0
          const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
          return z.permPowerUpAtk < 0 || z.permPowerUpDef < 0;
        },
        effect: (state) => {
          const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
          z.permPowerUpAtk = Math.max(z.permPowerUpAtk, 0);
          z.permPowerUpDef = Math.max(z.permPowerUpDef, 0);
        },
      },
    ];
  },
  [Monster.DarkZebra]: (state, { zoneCoords, dKey, ownMonsters }) => {
    // If this is the only Monster Card in your control at start of
    // own turn, it is changed to Defense Position and locked
    return [
      {
        condition: () => {
          const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
          return (
            isStartOfTurn(state, dKey) &&
            countMatchesInRow(state, ownMonsters) === 1 &&
            (!z.isLocked || z.battlePosition === BattlePosition.Attack)
          );
        },
        effect: (state) => {
          const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
          z.battlePosition = BattlePosition.Defence;
          z.isLocked = true;
        },
      },
    ];
  },
  [Monster.CeremonialBell]: (state, { ownHand, otherHand }) => {
    return [
      {
        condition: () => {
          return (
            hasMatchInRow(state, ownHand, isFaceDown) ||
            hasMatchInRow(state, otherHand, isFaceDown)
          );
        },
        effect: (state) => {
          setRowFaceUp(state, ownHand);
          setRowFaceUp(state, otherHand);
        },
      },
    ];
  },
  [Monster.BanisherOfTheLight]: (
    state,
    { ownGraveyard, otherGraveyard, dKey, otherDKey }
  ) => {
    return [
      {
        condition: () => {
          return (
            hasMatchInRow(state, ownGraveyard) ||
            hasMatchInRow(state, otherGraveyard)
          );
        },
        effect: (state) => {
          clearGraveyard(state, dKey);
          clearGraveyard(state, otherDKey);
        },
      },
    ];
  },
  [Monster.GiantRex]: (state, { otherMonsters, zoneCoords }) => {
    // cannot attack unless opp has mons -- cannot attack directly
    const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
    return [
      {
        condition: () =>
          !countMatchesInRow(state, otherMonsters) && !z.isLocked,
        effect: () => (z.isLocked = true),
      },
    ];
  },
  [Monster.CastleOfDarkIllusions]: (state, { ownMonsters, dKey }) => {
    return [
      {
        condition: () => {
          return (
            !countMatchesInRow(state, ownMonsters, isZombie) &&
            isStartOfTurn(state, dKey)
          );
        },
        effect: () => {
          updateMonsters(
            state,
            ownMonsters,
            (z) => {
              z.permPowerUpAtk += 200;
              z.permPowerUpDef += 200;
            },
            isZombie
          );
        },
      },
    ];
  },
  [Monster.LegendaryFiend]: (state, { dKey, zoneCoords }) => {
    return [
      {
        condition: () => isStartOfTurn(state, dKey),
        effect: (state) => permPowerUp(state, zoneCoords, 700, 0),
      },
    ];
  },
};

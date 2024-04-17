import { AutoEffectMonster, Field, Monster } from "../common";
import { getExodiaCards } from "../util/cardUtil";
import { isStartOfEitherTurn } from "../util/duelUtil";
import { burn, isStartOfTurn } from "../util/duellistUtil";
import { setActiveField } from "../util/fieldUtil";
import { graveyardContainsCards } from "../util/graveyardUtil";
import {
  clearAllTraps,
  hasMatchInRow,
  powerDownHighestAtk,
  setRowFaceDown,
} from "../util/rowUtil";
import {
  clearZone,
  destroyAtCoords,
  isAlignment,
  isTrap,
  permPowerDown,
  permPowerUp,
  specialSummon,
  specialSummonAtCoords,
} from "../util/zoneUtil";

export const autoMonsterEffects: CardReducerMap<
  AutoEffectMonster,
  MultiEffConReducer
> = {
  [Monster.ThunderNyanNyan]: (state, { zoneCoords, ownMonsters }) => {
    return [
      {
        condition: () => {
          return hasMatchInRow(
            state,
            ownMonsters,
            (z) => !isAlignment(z, "Light")
          );
        },
        effect: () => {
          destroyAtCoords(state, zoneCoords);
        },
      },
    ];
  },
  [Monster.ExodiaNecross]: (state, { zoneCoords, dKey }) => {
    return [
      {
        condition: () => {
          return !graveyardContainsCards(state, dKey, ...getExodiaCards());
        },
        effect: () => {
          destroyAtCoords(state, zoneCoords);
        },
      },
      {
        condition: () => {
          return isStartOfTurn(state, dKey);
        },
        effect: (state, { zoneCoords }) => {
          permPowerUp(state, zoneCoords);
        },
      },
    ];
  },
  [Monster.Jinzo]: (state, { otherMonsters, otherDKey }) => {
    return [
      {
        condition: () => {
          return hasMatchInRow(state, otherMonsters, isTrap);
        },
        effect: (state) => {
          clearAllTraps(state, otherDKey);
        },
      },
    ];
  },
  [Monster.CastleOfDarkIllusions]: (state) => {
    return [
      {
        condition: () => {
          return isStartOfEitherTurn(state);
        },
        effect: (state, { dKey, ownMonsters }) => {
          setActiveField(state, dKey, Field.Yami);
          setRowFaceDown(state, ownMonsters);
        },
      },
    ];
  },
  [Monster.SatelliteCannon]: (state, { dKey }) => {
    return [
      {
        condition: () => {
          return isStartOfTurn(state, dKey);
        },
        effect: (state, { zoneCoords }) => {
          permPowerUp(state, zoneCoords, 2);
        },
      },
    ];
  },
  [Monster.LavaGolem]: (state, { dKey }) => {
    return [
      {
        condition: () => {
          return isStartOfTurn(state, dKey);
        },
        effect: (state, { dKey }) => {
          burn(state, dKey, 700);
        },
      },
    ];
  },
  [Monster.ViserDes]: (state, { dKey, otherMonsters }) => {
    return [
      {
        condition: () => {
          return (
            isStartOfTurn(state, dKey) && hasMatchInRow(state, otherMonsters)
          );
        },
        effect: (state, { otherDKey }) => {
          powerDownHighestAtk(state, otherDKey);
        },
      },
    ];
  },
  [Monster.MirageKnight]: (state, { dKey }) => {
    return [
      {
        condition: () => {
          return isStartOfTurn(state, dKey);
        },
        effect: (state, { zoneCoords, dKey }) => {
          clearZone(state, zoneCoords);
          specialSummon(state, dKey, Monster.DarkMagician);
          specialSummon(state, dKey, Monster.FlameSwordsman);
        },
      },
    ];
  },
  [Monster.BerserkDragon]: (state, { otherDKey }) => {
    return [
      {
        condition: () => {
          return isStartOfTurn(state, otherDKey);
        },
        effect: (state, { zoneCoords }) => {
          permPowerDown(state, zoneCoords);
        },
      },
    ];
  },
  [Monster.PetitMoth]: (state, { dKey }) => {
    return [
      {
        condition: () => {
          return isStartOfTurn(state, dKey);
        },
        effect: (state, { zoneCoords }) => {
          specialSummonAtCoords(state, zoneCoords, Monster.LarvaeMoth);
        },
      },
    ];
  },
  [Monster.LarvaeMoth]: (state, { dKey }) => {
    return [
      {
        condition: () => {
          return isStartOfTurn(state, dKey);
        },
        effect: (state, { zoneCoords }) => {
          specialSummonAtCoords(state, zoneCoords, Monster.CocoonOfEvolution);
        },
      },
    ];
  },
  [Monster.CocoonOfEvolution]: (state, { dKey }) => {
    return [
      {
        condition: () => {
          return isStartOfTurn(state, dKey);
        },
        effect: (state, { zoneCoords }) => {
          specialSummonAtCoords(state, zoneCoords, Monster.GreatMoth);
        },
      },
    ];
  },
  [Monster.GreatMoth]: (state, { dKey }) => {
    return [
      {
        condition: () => {
          return isStartOfTurn(state, dKey);
        },
        effect: (state, { zoneCoords }) => {
          specialSummonAtCoords(
            state,
            zoneCoords,
            Monster.PerfectlyUltimateGreatMoth
          );
        },
      },
    ];
  },
};

import {
  burn,
  clearAllTraps,
  clearZone,
  destroyAtCoords,
  permPowerDown,
  permPowerUp,
  powerDownHighestAtk,
  setField,
  setRowFaceDown,
  specialSummon,
} from "./cardEffectUtil";
import { Field, Monster, PermAutoEffectMonster } from "./common";
import { StateMap, ZoneCoordsMap } from "./duelSlice";
import {
  getExodiaCards,
  graveyardContainsCards,
  hasMatchInRow,
  isAlignment,
  isTrap,
} from "./duelUtil";

type MonsterPermAutoEffectReducer = (
  stateMap: StateMap,
  coordsMap: ZoneCoordsMap
) => {
  condition: () => boolean;
  effect: (stateMap: StateMap, coordsMap: ZoneCoordsMap) => void;
}[];

type MonsterPermAutoEffectReducers = {
  [key in PermAutoEffectMonster]: MonsterPermAutoEffectReducer;
};

export const monsterPermAutoEffectReducers: MonsterPermAutoEffectReducers = {
  [Monster.ThunderNyanNyan]: (
    { state },
    { zoneCoords, ownMonsters, otherMonsters }
  ) => {
    return [
      {
        condition: () => {
          return (
            hasMatchInRow(
              state,
              ownMonsters,
              (z) => !isAlignment(z, "Light")
            ) ||
            hasMatchInRow(state, otherMonsters, (z) => !isAlignment(z, "Light"))
          );
        },
        effect: () => {
          destroyAtCoords(state, zoneCoords);
        },
      },
    ];
  },
  [Monster.ExodiaNecross]: ({ state }, { zoneCoords, dKey }) => {
    return [
      {
        condition: () => {
          return !graveyardContainsCards(state, dKey, ...getExodiaCards());
        },
        effect: () => {
          // If there are no Exodia parts in the graveyard, it disappears
          destroyAtCoords(state, zoneCoords);
        },
      },
      {
        condition: () => {
          // TODO: start of own turn
          return true;
        },
        effect: ({ state }, { zoneCoords }) => {
          permPowerUp(state, zoneCoords);
        },
      },
    ];
  },
  [Monster.Jinzo]: ({ state }, { otherMonsters, otherDKey }) => {
    return [
      {
        condition: () => {
          return hasMatchInRow(state, otherMonsters, (z) => isTrap(z));
        },
        effect: ({ state }) => {
          clearAllTraps(state, otherDKey);
        },
      },
    ];
  },
  [Monster.CastleOfDarkIllusions]: () => {
    return [
      {
        condition: () => {
          // TODO: start of BOTH turns
          return true;
        },
        effect: ({ state }, { ownMonsters }) => {
          setField(state, Field.Yami);
          setRowFaceDown(state, ownMonsters);
        },
      },
    ];
  },
  [Monster.SatelliteCannon]: () => {
    return [
      {
        condition: () => {
          // TODO: start of own turn
          return true;
        },
        effect: ({ state }, { zoneCoords }) => {
          permPowerUp(state, zoneCoords, 2);
        },
      },
    ];
  },
  [Monster.LavaGolem]: () => {
    return [
      {
        condition: () => {
          // TODO: start of own turn
          return true;
        },
        effect: ({ state }, { dKey }) => {
          burn(state, dKey, 700);
        },
      },
    ];
  },
  [Monster.ViserDes]: ({ state }, { otherMonsters }) => {
    return [
      {
        condition: () => {
          // TODO: start of own turn
          return hasMatchInRow(state, otherMonsters);
        },
        effect: ({ state }, { otherDKey }) => {
          powerDownHighestAtk(state, otherDKey);
        },
      },
    ];
  },
  [Monster.MirageKnight]: () => {
    return [
      {
        condition: () => {
          // TODO: start of own turn
          return true;
        },
        effect: ({ state }, { zoneCoords, dKey }) => {
          clearZone(state, zoneCoords);
          specialSummon(state, dKey, Monster.DarkMagician);
          specialSummon(state, dKey, Monster.FlameSwordsman);
        },
      },
    ];
  },
  [Monster.BerserkDragon]: () => {
    return [
      {
        condition: () => {
          // TODO: start of FOE's turn
          return true;
        },
        effect: ({ state }, { zoneCoords }) => {
          permPowerDown(state, zoneCoords);
        },
      },
    ];
  },
};

import {
  burn,
  clearAllTraps,
  destroySelf,
  permPowerDown,
  permPowerUp,
  powerDownHighestAtk,
  setField,
  setRowFaceDown,
  specialSummon,
} from "./cardEffectUtil";
import { Field, Monster, PermAutoEffectMonster } from "./common";
import {
  MonsterAutoEffectReducer,
  MonsterEffectReducer,
} from "./coreDuelReducers";
import { getExodiaCards, hasMatchInRow, isTrap } from "./duelUtil";

type MonsterPermAutoEffectReducers = {
  [key in PermAutoEffectMonster]: MonsterAutoEffectReducer<MonsterEffectReducer>;
};

export const monsterPermAutoEffectReducers: MonsterPermAutoEffectReducers = {
  [Monster.ThunderNyanNyan]: ({ originatorState }, monsterIdx) => {
    return [
      {
        condition: () => {
          return hasMatchInRow(
            originatorState.monsterZones,
            (z) => (z.card as MonsterCard).alignment !== "Light"
          );
        },
        effect: () => {
          // TODO: BUG
          // destroys card on wrong side of field if is non-owner's turn
          // needs to destroyAtCoords, but that needs zoneCoords as the second arg of the reducer...
          destroySelf(originatorState, monsterIdx);
        },
      },
    ];
  },
  [Monster.ExodiaNecross]: ({ originatorState }, monsterIdx) => {
    return [
      {
        condition: () => {
          return (
            !originatorState.graveyard ||
            !getExodiaCards().includes(originatorState.graveyard)
          );
        },
        effect: () => {
          // If there are no Exodia parts in the graveyard, it disappears
          destroySelf(originatorState, monsterIdx);
        },
      },
      {
        condition: () => {
          // TODO: start of own turn
          return true;
        },
        effect: ({ originatorState }, monsterIdx) => {
          permPowerUp(originatorState, monsterIdx);
        },
      },
    ];
  },
  [Monster.Jinzo]: ({ targetState }) => {
    return [
      {
        condition: () => {
          return hasMatchInRow(targetState.spellTrapZones, (z) => isTrap(z));
        },
        effect: ({ targetState }) => {
          clearAllTraps(targetState);
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
        effect: ({ state, originatorState }) => {
          setField(state, Field.Yami);
          setRowFaceDown(originatorState.monsterZones);
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
        effect: ({ originatorState }, monsterIdx) => {
          permPowerUp(originatorState, monsterIdx, 2);
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
        effect: ({ originatorState }) => {
          burn(originatorState, 700);
        },
      },
    ];
  },
  [Monster.ViserDes]: ({ targetState }) => {
    return [
      {
        condition: () => {
          // TODO: start of own turn
          return hasMatchInRow(targetState.monsterZones);
        },
        effect: ({ targetState }) => {
          powerDownHighestAtk(targetState);
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
        effect: ({ originatorState }, monsterIdx) => {
          destroySelf(originatorState, monsterIdx);
          specialSummon(originatorState, Monster.DarkMagician);
          specialSummon(originatorState, Monster.FlameSwordsman);
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
        effect: ({ originatorState }, monsterIdx) => {
          permPowerDown(originatorState, monsterIdx);
        },
      },
    ];
  },
};

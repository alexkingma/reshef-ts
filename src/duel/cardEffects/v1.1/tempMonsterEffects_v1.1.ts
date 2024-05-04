import { Monster } from "@/duel/common";
import {
  isDark,
  isEarth,
  isFire,
  isLight,
  isWater,
  isWind,
} from "@/duel/util/cardAlignmentUtil";
import { always } from "@/duel/util/common";
import { countMatchesInRow, powerDownHighestAtk } from "@/duel/util/rowUtil";
import {
  isMon,
  getEffCon_powerUpSelfConditional as powerUpSelf,
  tempDown,
  tempUp,
  getEffCon_updateMatchesInRow as updateMatches,
} from "@/duel/util/wrappedUtil";
import { tempPowerDown, tempPowerUp } from "@/duel/util/zoneUtil";

export const tempMonsterEffects: CardSubsetReducerMap<
  Monster,
  MultiEffConReducer
> = {
  // power up cross-field
  [Monster.NightmarePenguin]: (state, { ownMonsters }) => {
    return [updateMatches(state, ownMonsters, tempUp(200, 0), isWater)];
  },
  [Monster.MilusRadiant]: (state, { ownMonsters, otherMonsters }) => {
    return [
      updateMatches(state, ownMonsters, tempUp(500, 0), isEarth),
      updateMatches(state, ownMonsters, tempDown(400, 0), isWind),
      updateMatches(state, otherMonsters, tempUp(500, 0), isEarth),
      updateMatches(state, otherMonsters, tempDown(400, 0), isWind),
    ];
  },
  [Monster.StarBoy]: (state, { ownMonsters, otherMonsters }) => {
    return [
      updateMatches(state, ownMonsters, tempUp(500, 0), isWater),
      updateMatches(state, ownMonsters, tempDown(400, 0), isFire),
      updateMatches(state, otherMonsters, tempUp(500, 0), isWater),
      updateMatches(state, otherMonsters, tempDown(400, 0), isFire),
    ];
  },
  [Monster.LittleChimera]: (state, { ownMonsters, otherMonsters }) => {
    return [
      updateMatches(state, ownMonsters, tempUp(500, 0), isFire),
      updateMatches(state, ownMonsters, tempDown(400, 0), isWater),
      updateMatches(state, otherMonsters, tempUp(500, 0), isFire),
      updateMatches(state, otherMonsters, tempDown(400, 0), isWater),
    ];
  },
  [Monster.WitchsApprentice]: (state, { ownMonsters, otherMonsters }) => {
    return [
      updateMatches(state, ownMonsters, tempUp(500, 0), isDark),
      updateMatches(state, ownMonsters, tempDown(400, 0), isLight),
      updateMatches(state, otherMonsters, tempUp(500, 0), isDark),
      updateMatches(state, otherMonsters, tempDown(400, 0), isLight),
    ];
  },
  [Monster.Hoshiningen]: (state, { ownMonsters, otherMonsters }) => {
    return [
      updateMatches(state, ownMonsters, tempUp(500, 0), isLight),
      updateMatches(state, ownMonsters, tempDown(400, 0), isDark),
      updateMatches(state, otherMonsters, tempUp(500, 0), isLight),
      updateMatches(state, otherMonsters, tempDown(400, 0), isDark),
    ];
  },

  // unsorted
  [Monster.MukaMuka]: (state, { ownHand }) => {
    const effCon = powerUpSelf([[state, ownHand, always]], [], 300, 300);
    return [effCon];
  },
  [Monster.SwampBattleguard]: (state, { ownHand }) => {
    const effCon = powerUpSelf(
      [[state, ownHand, isMon(Monster.LavaBattleguard)]],
      [],
      500,
      0
    );
    return [effCon];
  },
  [Monster.LavaBattleguard]: (state, { ownHand }) => {
    const effCon = powerUpSelf(
      [[state, ownHand, isMon(Monster.SwampBattleguard)]],
      [],
      500,
      0
    );
    return [effCon];
  },
  [Monster.FlashAssailant]: (state, { ownHand }) => {
    const effCon = powerUpSelf([[state, ownHand, always]], [], -400, -400);
    return [effCon];
  },
  [Monster.BoarSoldier]: (state, { otherMonsters }) => {
    return [
      {
        condition: () => countMatchesInRow(state, otherMonsters) > 0,
        effect: (state, { zoneCoords }) => {
          tempPowerDown(state, zoneCoords, 1000, 0);
        },
      },
    ];
  },
  [Monster.NuviaTheWicked]: (state, { otherMonsters }) => {
    const effCon = powerUpSelf(
      [[state, otherMonsters, always]],
      [],
      -200,
      -200
    );
    return [effCon];
  },
  [Monster.BladeKnight]: (state, { ownHand }) => {
    return [
      {
        condition: () => countMatchesInRow(state, ownHand) <= 1,
        effect: (state, { zoneCoords }) => {
          tempPowerUp(state, zoneCoords, 400, 0);
        },
      },
    ];
  },
  [Monster.DarkJeroid]: (state, { otherDKey, otherMonsters }) => {
    return [
      {
        condition: () =>
          countMatchesInRow(
            state,
            otherMonsters,
            (z) => (z as OccupiedMonsterZone).card.effAtk > 0
          ) > 0,
        effect: () => {
          powerDownHighestAtk(state, otherDKey, 800, 0);
        },
      },
    ];
  },
};

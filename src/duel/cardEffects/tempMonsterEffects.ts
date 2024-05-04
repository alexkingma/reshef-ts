import { Monster, TempEffectMonster } from "../common";
import { isDark, isLight } from "../util/cardAlignmentUtil";
import {
  isDragon,
  isFairy,
  isInsect,
  isMachine,
  isOneOfTypes,
  isPlant,
} from "../util/cardTypeUtil";
import {
  countMatchesInRow,
  getHighestAtkZoneIdx,
  hasMatchInRow,
} from "../util/rowUtil";
import {
  isMon,
  getEffCon_powerUpSelfConditional as powerUpSelf,
  tempDown,
  tempUp,
  getEffCon_updateMatchesInRow as updateMatches,
} from "../util/wrappedUtil";
import { tempPowerDown, tempPowerUp } from "../util/zoneUtil";

const tempDown500 = tempDown(500, 500);
const tempUp500 = tempUp(500, 500);

export const tempMonsterEffects: CardReducerMap<
  TempEffectMonster,
  MultiEffConReducer
> = {
  // power down enemies
  [Monster.MammothGraveyard]: (state, { otherMonsters }) => {
    const effCon = updateMatches(state, otherMonsters, tempDown500);
    return [effCon];
  },
  [Monster.DarkJeroid]: (state, { otherMonsters }) => {
    return [
      {
        condition: () => {
          return hasMatchInRow(state, otherMonsters);
        },
        effect: () => {
          const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
          if (targetIdx === -1) return;
          tempPowerDown(state, [...otherMonsters, targetIdx], 500, 500);
        },
      },
    ];
  },

  // power up cross-field
  [Monster.Hoshiningen]: (state, { ownMonsters, otherMonsters }) => {
    return [
      updateMatches(state, ownMonsters, tempUp500, isLight),
      updateMatches(state, ownMonsters, tempDown500, isDark),
      updateMatches(state, otherMonsters, tempUp500, isLight),
      updateMatches(state, otherMonsters, tempDown500, isDark),
    ];
  },
  [Monster.WitchsApprentice]: (state, { ownMonsters, otherMonsters }) => {
    return [
      updateMatches(state, ownMonsters, tempDown500, isLight),
      updateMatches(state, ownMonsters, tempUp500, isDark),
      updateMatches(state, otherMonsters, tempDown500, isLight),
      updateMatches(state, otherMonsters, tempUp500, isDark),
    ];
  },

  // power up allies
  [Monster.MysticalElf]: (state, { ownMonsters }) => {
    const effCon = updateMatches(
      state,
      ownMonsters,
      tempUp500,
      isMon(Monster.BlueEyesWhiteDragon)
    );
    return [effCon];
  },
  [Monster.HarpieLady]: (state, { ownMonsters }) => {
    // wording says powers up "a" pet dragon, but that's not how it works
    const effCon = updateMatches(
      state,
      ownMonsters,
      tempUp500,
      isMon(Monster.HarpiesPetDragon)
    );
    return [effCon];
  },
  [Monster.CyberHarpie]: (state, { ownMonsters }) => {
    const effCon = updateMatches(
      state,
      ownMonsters,
      tempUp500,
      isMon(Monster.HarpiesPetDragon)
    );
    return [effCon];
  },
  [Monster.HarpieLadySisters]: (state, { ownMonsters }) => {
    const effCon = updateMatches(
      state,
      ownMonsters,
      tempUp(1000, 1000),
      isMon(Monster.HarpiesPetDragon)
    );
    return [effCon];
  },
  [Monster.MonsterTamer]: (state, { ownMonsters }) => {
    const effCon = updateMatches(
      state,
      ownMonsters,
      tempUp500,
      isMon(Monster.DungeonWorm)
    );
    return [effCon];
  },
  [Monster.PumpkingTheKingOfGhosts]: (state, { ownMonsters }) => {
    const cards: Monster[] = [
      Monster.ArmoredZombie,
      Monster.DragonZombie,
      Monster.ClownZombie,
    ];
    const effCon = updateMatches(state, ownMonsters, tempUp500, (z) =>
      cards.includes(z.card.id)
    );
    return [effCon];
  },
  [Monster.MWarrior1]: (state, { ownMonsters }) => {
    const effCon = updateMatches(
      state,
      ownMonsters,
      tempUp500,
      isMon(Monster.MWarrior2)
    );
    return [effCon];
  },
  [Monster.MWarrior2]: (state, { ownMonsters }) => {
    const effCon = updateMatches(
      state,
      ownMonsters,
      tempUp500,
      isMon(Monster.MWarrior1)
    );
    return [effCon];
  },
  [Monster.NightmarePenguin]: (state, { ownMonsters }) => {
    const effCon = updateMatches(
      state,
      ownMonsters,
      tempUp500,
      isOneOfTypes("Aqua", "Fish", "Sea Serpent", "Reptile")
    );
    return [effCon];
  },
  [Monster.CommandAngel]: (state, { ownMonsters }) => {
    const effCon = updateMatches(state, ownMonsters, tempUp500, isFairy);
    return [effCon];
  },

  // power up self
  [Monster.SwampBattleguard]: (state, { ownMonsters }) => {
    const effCon = powerUpSelf([
      [state, ownMonsters, isMon(Monster.LavaBattleguard)],
    ]);
    return [effCon];
  },
  [Monster.LavaBattleguard]: (state, { ownMonsters }) => {
    const effCon = powerUpSelf([
      [state, ownMonsters, isMon(Monster.SwampBattleguard)],
    ]);
    return [effCon];
  },
  [Monster.BusterBlader]: (state, { dKey, ownMonsters }) => {
    const isDragonCard = (c: MonsterCard) => c.type === "Dragon";
    const effCon = powerUpSelf(
      [[state, ownMonsters, isDragon]],
      [[state, dKey, isDragonCard]]
    );
    return [effCon];
  },
  [Monster.WodanTheResidentOfTheForest]: (state, { ownMonsters }) => {
    const effCon = powerUpSelf([[state, ownMonsters, isPlant]]);
    return [effCon];
  },
  [Monster.PerfectMachineKing]: (state, { ownMonsters, otherMonsters }) => {
    const effCon = powerUpSelf([
      [state, ownMonsters, isMachine, 2],
      [state, otherMonsters, isMachine, 2],
    ]);
    return [effCon];
  },
  [Monster.SliferTheSkyDragon]: (state, { ownHand }) => {
    const effCon = powerUpSelf([[state, ownHand, () => true, 3]]);
    return [effCon];
  },
  [Monster.LabyrinthTank]: (state, { ownMonsters }) => {
    const isLabyrinthWall = isMon(Monster.LabyrinthWall);
    const effCon = powerUpSelf([[state, ownMonsters, isLabyrinthWall]]);
    return [effCon];
  },
  [Monster.MachineKing]: (state, { ownMonsters, otherMonsters }) => {
    const effCon = powerUpSelf([
      [state, ownMonsters, isMachine],
      [state, otherMonsters, isMachine],
    ]);
    return [effCon];
  },
  [Monster.MasterOfDragonSoldier]: (state, { ownMonsters }) => {
    const effCon = powerUpSelf([[state, ownMonsters, isDragon]]);
    return [effCon];
  },
  [Monster.DarkMagicianGirl]: (state, { dKey }) => {
    const cards = [Monster.DarkMagician, Monster.MagicianOfBlackChaos];
    const isDarkMagician = (c: MonsterCard) => cards.includes(c.id);
    const effCon = powerUpSelf([], [[state, dKey, isDarkMagician]]);
    return [effCon];
  },
  [Monster.ToonDarkMagicianGirl]: (state, { dKey }) => {
    const cards = [Monster.DarkMagician, Monster.MagicianOfBlackChaos];
    const isDarkMagician = (c: MonsterCard) => cards.includes(c.id);
    const effCon = powerUpSelf([], [[state, dKey, isDarkMagician]]);
    return [effCon];
  },
  [Monster.InsectQueen]: (state, { ownMonsters }) => {
    const effCon = powerUpSelf([[state, ownMonsters, isInsect]]);
    return [effCon];
  },
  [Monster.BladeKnight]: (state, { ownHand }) => {
    return [
      {
        condition: () => {
          return countMatchesInRow(state, ownHand) <= 1;
        },
        effect: (state, { zoneCoords }) => {
          tempPowerUp(state, zoneCoords, 500, 500);
        },
      },
    ];
  },
};

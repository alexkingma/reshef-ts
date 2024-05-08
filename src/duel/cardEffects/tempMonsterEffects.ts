import { RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { isDark, isLight, isLightOrDark } from "../util/cardAlignmentUtil";
import {
  isDragon,
  isFairy,
  isInsect,
  isMachine,
  isOneOfTypes,
  isPlant,
} from "../util/cardTypeUtil";
import { effCon_DarkMagicianGirl } from "../util/effectsUtil";
import {
  countMatchesInRow,
  getHighestAtkZoneIdx,
  hasMatchInRow,
  updateMonsters,
} from "../util/rowUtil";
import {
  isMon,
  getEffCon_powerUpSelfFromOwnMonsters as powerUpSelfFromOwnMonsters,
  tempDown,
  tempUp,
  getEffCon_updateOtherMonsters as updateOtherMonsters,
  getEffCon_updateOwnMonsters as updateOwnMonsters,
} from "../util/wrappedUtil";
import { tempPowerDown, tempPowerUp } from "../util/zoneUtil";

const tempDown500 = tempDown(500, 500);
const tempUp500 = tempUp(500, 500);

export const tempMonsterEffects: CardEffectMap<AutoEffectReducer> = {
  // power down enemies
  [Monster.MammothGraveyard]: {
    ...updateOtherMonsters(tempDown500),
    dialogue: "TODO",
  },
  [Monster.DarkJeroid]: {
    row: RowKey.Monster,
    condition: (state, { otherMonsters }) => {
      return hasMatchInRow(state, otherMonsters);
    },
    effect: (state, { otherMonsters }) => {
      const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
      if (targetIdx === -1) return;
      tempPowerDown(state, [...otherMonsters, targetIdx], 500, 500);
    },
    dialogue: "TODO",
  },

  // power up cross-field
  [Monster.Hoshiningen]: {
    row: RowKey.Monster,
    condition: (state, { ownMonsters, otherMonsters }) => {
      return (
        hasMatchInRow(state, otherMonsters, isLightOrDark) ||
        hasMatchInRow(state, ownMonsters, isLightOrDark)
      );
    },
    effect: (state, { ownMonsters, otherMonsters }) => {
      updateMonsters(state, ownMonsters, tempUp500, isLight);
      updateMonsters(state, ownMonsters, tempDown500, isDark);
      updateMonsters(state, otherMonsters, tempUp500, isLight);
      updateMonsters(state, otherMonsters, tempDown500, isDark);
    },
    dialogue: "TODO",
  },
  [Monster.WitchsApprentice]: {
    row: RowKey.Monster,
    condition: (state, { ownMonsters, otherMonsters }) => {
      return (
        hasMatchInRow(state, otherMonsters, isLightOrDark) ||
        hasMatchInRow(state, ownMonsters, isLightOrDark)
      );
    },
    effect: (state, { ownMonsters, otherMonsters }) => {
      updateMonsters(state, ownMonsters, tempUp500, isDark);
      updateMonsters(state, ownMonsters, tempDown500, isLight);
      updateMonsters(state, otherMonsters, tempUp500, isDark);
      updateMonsters(state, otherMonsters, tempDown500, isLight);
    },
    dialogue: "TODO",
  },

  // power up allies
  [Monster.MysticalElf]: {
    ...updateOwnMonsters(tempUp500, isMon(Monster.BlueEyesWhiteDragon)),
    dialogue: "TODO",
  },
  [Monster.HarpieLady]: {
    // wording says powers up "a" pet dragon, but that's not how it works
    ...updateOwnMonsters(tempUp500, isMon(Monster.HarpiesPetDragon)),
    dialogue: "TODO",
  },
  [Monster.CyberHarpie]: {
    ...updateOwnMonsters(tempUp500, isMon(Monster.HarpiesPetDragon)),
    dialogue: "TODO",
  },
  [Monster.HarpieLadySisters]: {
    ...updateOwnMonsters(tempUp(1000, 1000), isMon(Monster.HarpiesPetDragon)),
    dialogue: "TODO",
  },
  [Monster.MonsterTamer]: {
    ...updateOwnMonsters(tempUp500, isMon(Monster.DungeonWorm)),
    dialogue: "TODO",
  },
  [Monster.PumpkingTheKingOfGhosts]: {
    ...updateOwnMonsters(tempUp500, (z) =>
      [
        Monster.ArmoredZombie,
        Monster.DragonZombie,
        Monster.ClownZombie,
      ].includes(z.id)
    ),
    dialogue: "TODO",
  },
  [Monster.MWarrior1]: {
    ...updateOwnMonsters(tempUp500, isMon(Monster.MWarrior2)),
    dialogue: "TODO",
  },
  [Monster.MWarrior2]: {
    ...updateOwnMonsters(tempUp500, isMon(Monster.MWarrior1)),
    dialogue: "TODO",
  },
  [Monster.NightmarePenguin]: {
    ...updateOwnMonsters(
      tempUp500,
      isOneOfTypes("Aqua", "Fish", "Sea Serpent", "Reptile")
    ),
    dialogue: "TODO",
  },
  [Monster.CommandAngel]: {
    ...updateOwnMonsters(tempUp500, isFairy),
    dialogue: "TODO",
  },

  // power up self
  [Monster.SwampBattleguard]: {
    ...powerUpSelfFromOwnMonsters(isMon(Monster.LavaBattleguard)),
    dialogue: "TODO",
  },
  [Monster.LavaBattleguard]: {
    ...powerUpSelfFromOwnMonsters(isMon(Monster.SwampBattleguard)),
    dialogue: "TODO",
  },
  [Monster.BusterBlader]: {
    row: RowKey.Monster,
    condition: (state, { ownMonsters, ownGraveyard }) => {
      return (
        hasMatchInRow(state, ownMonsters, isDragon) ||
        hasMatchInRow(state, ownGraveyard, isDragon)
      );
    },
    effect: (state, { zoneCoords, ownMonsters, ownGraveyard }) => {
      const count =
        countMatchesInRow(state, ownMonsters, isDragon) +
        countMatchesInRow(state, ownGraveyard, isDragon);
      tempPowerUp(state, zoneCoords, count * 500, count * 500);
    },
    dialogue: "TODO",
  },
  [Monster.WodanTheResidentOfTheForest]: {
    ...powerUpSelfFromOwnMonsters(isPlant),
    dialogue: "TODO",
  },
  [Monster.MachineKing]: {
    ...powerUpSelfFromOwnMonsters(isMachine),
    dialogue: "TODO",
  },
  [Monster.PerfectMachineKing]: {
    ...powerUpSelfFromOwnMonsters(isPlant, 1000, 1000),
    dialogue: "TODO",
  },
  [Monster.SliferTheSkyDragon]: {
    row: RowKey.Monster,
    condition: (state, { ownHand }) => {
      return hasMatchInRow(state, ownHand);
    },
    effect: (state, { zoneCoords, ownHand }) => {
      const count = countMatchesInRow(state, ownHand);
      tempPowerUp(state, zoneCoords, count * 1500, count * 1500);
    },
    dialogue: "TODO",
  },
  [Monster.LabyrinthTank]: {
    ...powerUpSelfFromOwnMonsters(isMon(Monster.LabyrinthWall)),
    dialogue: "TODO",
  },
  [Monster.MasterOfDragonSoldier]: {
    ...powerUpSelfFromOwnMonsters(isDragon),
    dialogue: "TODO",
  },
  [Monster.DarkMagicianGirl]: {
    ...effCon_DarkMagicianGirl,
    dialogue: "TODO",
  },
  [Monster.ToonDarkMagicianGirl]: {
    ...effCon_DarkMagicianGirl,
    dialogue: "TODO",
  },
  [Monster.InsectQueen]: {
    ...powerUpSelfFromOwnMonsters(isInsect),
    dialogue: "TODO",
  },
  [Monster.BladeKnight]: {
    row: RowKey.Monster,
    condition: (state, { ownHand }) => {
      return countMatchesInRow(state, ownHand) <= 1;
    },
    effect: (state, { zoneCoords }) => {
      tempPowerUp(state, zoneCoords, 500, 500);
    },
    dialogue: "TODO",
  },
};

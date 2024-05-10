import { CardTextPrefix as Pre } from "../enums/dialogue";
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
import { isFaceUp, tempPowerDown, tempPowerUp } from "../util/zoneUtil";

const tempDown500 = tempDown(500, 500);
const tempUp500 = tempUp(500, 500);

export const tempMonsterEffects: CardEffectMap<AutoEffectReducer> = {
  // power down enemies
  [Monster.MammothGraveyard]: {
    ...updateOtherMonsters(tempDown500),
    text: `${Pre.Auto}Powered down every monster on the foe's field.`,
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
    text: `${Pre.Auto}Weakened the enemy monster with the highest ATK.`,
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
    text: `${Pre.Auto}Light element monsters on the own field will be powered up.\nDark beings on the own field will be weakened.`,
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
    text: `${Pre.Auto}Dark monsters on the player's field will be powered up.\nLight monsters on the player's field will be weakened.`,
  },

  // power up allies
  [Monster.MysticalElf]: {
    ...updateOwnMonsters(tempUp500, isMon(Monster.BlueEyesWhiteDragon)),
    text: `${Pre.Auto}Powered up a Blue Eyes White Dragon on the own field.`,
  },
  [Monster.HarpieLady]: {
    // wording says powers up "a" pet dragon, but that's not how it works
    ...updateOwnMonsters(tempUp500, isMon(Monster.HarpiesPetDragon)),
    text: `${Pre.Auto}Powered up a Harpie's Pet Dragon on own field.`,
  },
  [Monster.CyberHarpie]: {
    // TODO: text is different to harpie lady, double check
    ...updateOwnMonsters(tempUp500, isMon(Monster.HarpiesPetDragon)),
    text: `${Pre.Auto}Powered up Harpie's Pet Dragons on own field.`,
  },
  [Monster.HarpieLadySisters]: {
    ...updateOwnMonsters(tempUp(1000, 1000), isMon(Monster.HarpiesPetDragon)),
    text: `${Pre.Auto}2X powered up a Harpie's Pet Dragon on own field.`,
  },
  [Monster.MonsterTamer]: {
    ...updateOwnMonsters(tempUp500, isMon(Monster.DungeonWorm)),
    text: `${Pre.Auto}Powered up a Dungeon Worm on the own field.`,
  },
  [Monster.PumpkingTheKingOfGhosts]: {
    ...updateOwnMonsters(tempUp500, (z) =>
      [
        Monster.ArmoredZombie,
        Monster.DragonZombie,
        Monster.ClownZombie,
      ].includes(z.id)
    ),
    text: `${Pre.Auto}Powered up all zombies on the own field.`,
  },
  [Monster.MWarrior1]: {
    ...updateOwnMonsters(tempUp500, isMon(Monster.MWarrior2)),
    text: `${Pre.Auto}Powered up a M-Warrior 2 on the own field.`,
  },
  [Monster.MWarrior2]: {
    ...updateOwnMonsters(tempUp500, isMon(Monster.MWarrior1)),
    text: `${Pre.Auto}Powered up a M-Warrior 1 on the own field.`,
  },
  [Monster.NightmarePenguin]: {
    ...updateOwnMonsters(
      tempUp500,
      isOneOfTypes("Aqua", "Fish", "Sea Serpent", "Reptile")
    ),
    text: `${Pre.Auto}Powered up monsters on own field.\nIt affects Aqua, Fish, Sea Serpent, & Reptile types.`,
  },
  [Monster.CommandAngel]: {
    ...updateOwnMonsters(tempUp500, isFairy),
    text: `${Pre.Auto}Powered up all fairies on the own field.`,
  },

  // power up self
  [Monster.SwampBattleguard]: {
    ...powerUpSelfFromOwnMonsters(isMon(Monster.LavaBattleguard)),
    text: `${Pre.Auto}Powered up for every Lava Battleguard on own field.`,
  },
  [Monster.LavaBattleguard]: {
    ...powerUpSelfFromOwnMonsters(isMon(Monster.SwampBattleguard)),
    text: `${Pre.Auto}Powered up for every Swamp Battleguard on own field.`,
  },
  [Monster.BusterBlader]: {
    row: RowKey.Monster,
    condition: (state, { otherMonsters, otherGraveyard }) => {
      return (
        hasMatchInRow(state, otherMonsters, isDragon) ||
        hasMatchInRow(state, otherGraveyard, isDragon)
      );
    },
    effect: (state, { zoneCoords, otherMonsters, otherGraveyard }) => {
      const count =
        countMatchesInRow(state, otherMonsters, isDragon) +
        countMatchesInRow(state, otherGraveyard, isDragon);
      tempPowerUp(state, zoneCoords, count * 500, count * 500);
    },
    text: `${Pre.Auto}Powered up for all dragons on foe's field & graveyard.`,
  },
  [Monster.WodanTheResidentOfTheForest]: {
    ...powerUpSelfFromOwnMonsters(isPlant),
    text: `${Pre.Auto}Powered up for every plant on the own field.`,
  },
  [Monster.MachineKing]: {
    row: RowKey.Monster,
    condition: (state, { ownMonsters }) => {
      return hasMatchInRow(state, ownMonsters, isMachine);
    },
    effect: (state, { zoneCoords, ownMonsters }) => {
      const count = countMatchesInRow(state, ownMonsters, isMachine);
      tempPowerUp(state, zoneCoords, count * 500, count * 500);
    },
    text: `${Pre.Auto}Powered up for every machine on both fields.`,
  },
  [Monster.PerfectMachineKing]: {
    row: RowKey.Monster,
    condition: (state, { ownMonsters, otherMonsters }) => {
      return (
        hasMatchInRow(state, ownMonsters, isMachine) ||
        hasMatchInRow(state, otherMonsters, isMachine)
      );
    },
    effect: (state, { zoneCoords, ownMonsters, otherMonsters }) => {
      const count =
        countMatchesInRow(state, ownMonsters, isMachine) +
        countMatchesInRow(state, otherMonsters, isMachine);
      tempPowerUp(state, zoneCoords, count * 1000, count * 1000);
    },
    text: `${Pre.Auto}2X powered up for every machine on both fields.`,
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
    text: `${Pre.Auto}3X powered up for every card in the own hand.`,
  },
  [Monster.LabyrinthTank]: {
    ...powerUpSelfFromOwnMonsters(isMon(Monster.LabyrinthWall)),
    text: `${Pre.Auto}Powered up for every Labyrinth Wall on own field.`,
  },
  [Monster.MasterOfDragonSoldier]: {
    ...powerUpSelfFromOwnMonsters((z) => isDragon(z) && isFaceUp(z)),
    text: `${Pre.Auto}Powered up for all face-up dragons on own field.`,
  },
  [Monster.DarkMagicianGirl]: effCon_DarkMagicianGirl,
  [Monster.ToonDarkMagicianGirl]: effCon_DarkMagicianGirl,
  [Monster.InsectQueen]: {
    ...powerUpSelfFromOwnMonsters((z) => isInsect(z) && isFaceUp(z)),
    text: `${Pre.Auto}Powered up for all face-up insects on own field.`,
  },
  [Monster.BladeKnight]: {
    row: RowKey.Monster,
    condition: (state, { ownHand }) => {
      return countMatchesInRow(state, ownHand) <= 1;
    },
    effect: (state, { zoneCoords }) => {
      tempPowerUp(state, zoneCoords, 500, 500);
    },
    text: `${Pre.Auto}Powered up for having one or no cards in hand.`,
  },
};

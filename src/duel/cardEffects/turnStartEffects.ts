import { CardTextPrefix as Pre } from "../enums/dialogue";
import { Orientation, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { Spell, Trap } from "../enums/spellTrapRitual";
import { getFinalCards } from "../util/cardUtil";
import { always } from "../util/common";
import { burn, winByFINAL } from "../util/duellistUtil";
import {
  effect_CastleOfDarkIllusions,
  effect_LavaGolem_Summon,
} from "../util/effectsUtil";
import { clearGraveyard, resurrectOwn } from "../util/graveyardUtil";
import {
  countMatchesInRow,
  destroyHighestAtk,
  hasEmptyZone,
  hasMatchInRow,
  powerDownHighestAtk,
  rowContainsAnyCards,
} from "../util/rowUtil";
import { burnSelf } from "../util/wrappedUtil";
import {
  clearZone,
  getZone,
  isNotGodCard,
  permPowerUp,
  setSpellTrap,
  specialSummon,
  specialSummonAtCoords,
} from "../util/zoneUtil";

export const turnStartEffects: CardEffectMap<AutoEffectReducer> = {
  [Spell.MessengerOfPeace]: {
    // activates on player's next turn regardless of
    // if there is a 1500+ on the field
    row: RowKey.SpellTrap,
    condition: always,
    effect: burnSelf(1000),
    text: `${Pre.Auto}Infliced 1,000LP damage on the player.`,
  },
  [Spell.JamBreedingMachine]: {
    row: RowKey.SpellTrap,
    text: `${Pre.Auto}Summoned a Change Slime to the own field.`,
    condition: always,
    effect: (state, { dKey }) => {
      // player is prevented from summoning, even if the
      // special summon fails due to no free zones
      specialSummon(state, dKey, Monster.ChangeSlime);
      state.activeTurn.hasNormalSummoned = true;
    },
  },
  [Trap.DestinyBoard]: {
    row: RowKey.SpellTrap,
    text: `${Pre.Auto}Added a letter to the Spirit Message on the own field.`,
    condition: (state, { ownSpellTrap }) => {
      return hasEmptyZone(state, ownSpellTrap);
    },
    effect: (state, { dKey, ownSpellTrap }) => {
      // The letters are always added in order, so you know which card
      // comes next based on the first letter that isn't in the row.
      for (const letter of getFinalCards()) {
        // letter already on board
        if (rowContainsAnyCards(state, ownSpellTrap, letter)) continue;

        setSpellTrap(state, dKey, letter, {
          orientation: Orientation.FaceUp,
        });

        if (letter === Trap.SpiritMessageL) {
          // the FINAL message is complete
          winByFINAL(state, dKey);
        }

        // only add one letter per turn
        return;
      }
    },
  },
  [Monster.ExodiaNecross]: {
    row: RowKey.Monster,
    condition: always,
    effect: (state, { zoneCoords }) => {
      permPowerUp(state, zoneCoords, 500, 500);
    },
    text: `${Pre.Auto}Powered up one level.`,
  },
  [Monster.CastleOfDarkIllusions]: effect_CastleOfDarkIllusions,
  [Monster.SatelliteCannon]: {
    row: RowKey.Monster,
    condition: (state, { zoneCoords }) => {
      const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
      return z.permPowerUpAtk < 3000 && z.permPowerUpDef < 3000;
    },
    effect: (state, { zoneCoords }) => {
      permPowerUp(state, zoneCoords, 1000, 1000);
    },
    text: `${Pre.Auto}Powered up two levels on own field to max six levels.`,
  },
  [Monster.LavaGolem]: [
    {
      row: RowKey.Monster,
      condition: always,
      effect: (state, { dKey }) => {
        burn(state, dKey, 700);
      },
      text: `${Pre.Auto}Inflicted 700LP damage on the player.`,
    },
    {
      row: RowKey.Hand,
      ...effect_LavaGolem_Summon,
    },
  ],
  [Monster.ViserDes]: {
    row: RowKey.Monster,
    condition: (state, { otherMonsters }) => {
      return hasMatchInRow(state, otherMonsters);
    },
    effect: (state, { otherDKey }) => {
      powerDownHighestAtk(state, otherDKey);
    },
    text: `${Pre.Auto}Weakened the enemy monster with the highest ATK.`,
  },
  [Monster.MirageKnight]: {
    row: RowKey.Monster,
    condition: always,
    effect: (state, { zoneCoords, dKey }) => {
      clearZone(state, zoneCoords);
      specialSummon(state, dKey, Monster.DarkMagician);
      specialSummon(state, dKey, Monster.FlameSwordsman);
    },
    text: `${Pre.Auto}Split into Dark Magician and Flame Swordsman.`,
  },
  [Monster.PetitMoth]: {
    row: RowKey.Monster,
    condition: always,
    effect: (state, { zoneCoords }) => {
      specialSummonAtCoords(state, zoneCoords, Monster.LarvaeMoth);
    },
    text: `Petit Moth transformed into Larvae Moth!`,
  },
  [Monster.LarvaeMoth]: {
    row: RowKey.Monster,
    condition: always,
    effect: (state, { zoneCoords }) => {
      specialSummonAtCoords(state, zoneCoords, Monster.CocoonOfEvolution);
    },
    text: `Larvae Moth transformed into Cocoon of Evolution!`,
  },
  [Monster.CocoonOfEvolution]: {
    row: RowKey.Monster,
    condition: always,
    effect: (state, { zoneCoords }) => {
      specialSummonAtCoords(state, zoneCoords, Monster.GreatMoth);
    },
    text: `Cocoon of Evolution transformed into Great Moth!`,
  },
  [Monster.GreatMoth]: {
    row: RowKey.Monster,
    condition: always,
    effect: (state, { zoneCoords }) => {
      specialSummonAtCoords(
        state,
        zoneCoords,
        Monster.PerfectlyUltimateGreatMoth
      );
    },
    text: `Great Moth transformed into Perfectly Ultimate Great Moth!`,
  },
  [Monster.Newdoria]: {
    row: RowKey.Graveyard,
    condition: (state, { otherMonsters }) => {
      return countMatchesInRow(state, otherMonsters) > 0;
    },
    effect: (state, { dKey, otherDKey }) => {
      destroyHighestAtk(state, otherDKey, isNotGodCard);
      clearGraveyard(state, dKey);
    },
    text: `${Pre.AutoGraveyard}Destroyed the enemy monster with the highest ATK.`,
  },
  [Monster.VampireLord]: {
    row: RowKey.Graveyard,
    condition: (state, { ownMonsters }) => {
      return hasEmptyZone(state, ownMonsters);
    },
    effect: (state, { dKey }) => {
      resurrectOwn(state, dKey);
    },
    text: `${Pre.AutoGraveyard}Resurrected to the own field.`,
  },
  [Monster.DifferentDimensionDragon]: {
    row: RowKey.Graveyard,
    condition: (state, { ownMonsters }) => {
      return hasEmptyZone(state, ownMonsters);
    },
    effect: (state, { dKey }) => {
      resurrectOwn(state, dKey);
    },
    text: `${Pre.AutoGraveyard}Resurrected to the own field.`,
  },
};

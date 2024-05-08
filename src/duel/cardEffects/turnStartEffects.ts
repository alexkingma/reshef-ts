import { Orientation, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { Spell, Trap } from "../enums/spellTrapRitual";
import { getFinalCards } from "../util/cardUtil";
import { always } from "../util/common";
import { burn, winByFINAL } from "../util/duellistUtil";
import {
  effConDi_LavaGolem_Summon,
  effect_CastleOfDarkIllusions,
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
    dialogue: "TODO",
  },
  [Spell.JamBreedingMachine]: {
    row: RowKey.SpellTrap,
    dialogue: "TODO",
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
    dialogue: "TODO",
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
    dialogue: "TODO",
  },
  [Monster.CastleOfDarkIllusions]: {
    row: RowKey.Monster,
    condition: always,
    effect: effect_CastleOfDarkIllusions,
    dialogue: "TODO",
  },
  [Monster.SatelliteCannon]: {
    row: RowKey.Monster,
    condition: always,
    effect: (state, { zoneCoords }) => {
      permPowerUp(state, zoneCoords, 1000, 1000);
    },
    dialogue: "TODO",
  },
  [Monster.LavaGolem]: [
    {
      row: RowKey.Monster,
      condition: always,
      effect: (state, { dKey }) => {
        burn(state, dKey, 700);
      },
      dialogue: "TODO",
    },
    {
      row: RowKey.Hand,
      ...effConDi_LavaGolem_Summon,
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
    dialogue: "TODO",
  },
  [Monster.MirageKnight]: {
    row: RowKey.Monster,
    condition: always,
    effect: (state, { zoneCoords, dKey }) => {
      clearZone(state, zoneCoords);
      specialSummon(state, dKey, Monster.DarkMagician);
      specialSummon(state, dKey, Monster.FlameSwordsman);
    },
    dialogue: "TODO",
  },
  [Monster.PetitMoth]: {
    row: RowKey.Monster,
    condition: always,
    effect: (state, { zoneCoords }) => {
      specialSummonAtCoords(state, zoneCoords, Monster.LarvaeMoth);
    },
    dialogue: "TODO",
  },
  [Monster.LarvaeMoth]: {
    row: RowKey.Monster,
    condition: always,
    effect: (state, { zoneCoords }) => {
      specialSummonAtCoords(state, zoneCoords, Monster.CocoonOfEvolution);
    },
    dialogue: "TODO",
  },
  [Monster.CocoonOfEvolution]: {
    row: RowKey.Monster,
    condition: always,
    effect: (state, { zoneCoords }) => {
      specialSummonAtCoords(state, zoneCoords, Monster.GreatMoth);
    },
    dialogue: "TODO",
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
    dialogue: "TODO",
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
    dialogue: "TODO",
  },
  [Monster.VampireLord]: {
    row: RowKey.Graveyard,
    condition: (state, { ownMonsters }) => {
      return hasEmptyZone(state, ownMonsters);
    },
    effect: (state, { dKey }) => {
      resurrectOwn(state, dKey);
    },
    dialogue: "TODO",
  },
  [Monster.DifferentDimensionDragon]: {
    row: RowKey.Graveyard,
    condition: (state, { ownMonsters }) => {
      return hasEmptyZone(state, ownMonsters);
    },
    effect: (state, { dKey }) => {
      resurrectOwn(state, dKey);
    },
    dialogue: "TODO",
  },
};

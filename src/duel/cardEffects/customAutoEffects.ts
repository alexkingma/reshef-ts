import { CardTextPrefix as Pre } from "../enums/dialogue";
import { Orientation, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { Spell, Trap } from "../enums/spellTrapRitual";
import { isLight } from "../util/cardAlignmentUtil";
import { getExodiaCards } from "../util/cardUtil";
import { winByExodia } from "../util/duellistUtil";
import { clearGraveyard, graveyardContainsCards } from "../util/graveyardUtil";
import {
  clearAllTraps,
  hasEmptyZone,
  hasFullExodia,
  hasMatchInRow,
  updateMonsters,
} from "../util/rowUtil";
import { getEffCon_requireDestinyBoard as requireDestinyBoard } from "../util/wrappedUtil";
import {
  destroyAtCoords,
  getZone,
  immobiliseZone,
  isFaceDown,
  isMinAtk,
  isMonster,
  isTrap,
  specialSummon,
} from "../util/zoneUtil";

const isUnlocked1500 = (z: Zone) => isMinAtk(z, 1500) && !z.isLocked;

export const customAutoEffects: CardEffectMap<AutoEffectReducer> = {
  [Spell.MessengerOfPeace]: {
    row: RowKey.SpellTrap,
    text: `${Pre.Auto}Immobilised all monsters with 1,500 ATK or higher.`,
    condition: (state, { ownMonsters, otherMonsters }) => {
      return (
        hasMatchInRow(state, otherMonsters, isUnlocked1500) ||
        hasMatchInRow(state, ownMonsters, isUnlocked1500)
      );
    },
    effect: (state, { ownMonsters, otherMonsters }) => {
      updateMonsters(state, ownMonsters, immobiliseZone, isUnlocked1500);
      updateMonsters(state, otherMonsters, immobiliseZone, isUnlocked1500);
    },
  },
  [Spell.JamBreedingMachine]: {
    row: RowKey.SpellTrap,
    text: `${Pre.Auto}No monsters can be summoned from the own deck.`,
    condition: (state, { zoneCoords }) => {
      // on initial set only
      const z = getZone(state, zoneCoords) as OccupiedSpellTrapZone;
      return isFaceDown(z);
    },
    effect: (state, { zoneCoords }) => {
      state.activeTurn.hasNormalSummoned = true;
      const z = getZone(state, zoneCoords) as OccupiedSpellTrapZone;
      z.orientation = Orientation.FaceUp;
    },
  },
  [Trap.SpiritMessageI]: requireDestinyBoard(),
  [Trap.SpiritMessageN]: requireDestinyBoard(),
  [Trap.SpiritMessageA]: requireDestinyBoard(),
  [Trap.SpiritMessageL]: requireDestinyBoard(),
  [Monster.ThunderNyanNyan]: {
    row: RowKey.Monster,
    condition: (state, { ownMonsters }) => {
      const anyButLight = (z: Zone) => isMonster(z) && !isLight(z);
      return hasMatchInRow(state, ownMonsters, anyButLight);
    },
    effect: (state, { zoneCoords }) => {
      destroyAtCoords(state, zoneCoords);
    },
    text: `${Pre.Auto}It was sent to the graveyard because a non-light monster appeared on the own field.`,
  },
  [Monster.ExodiaNecross]: {
    row: RowKey.Monster,
    condition: (state, { dKey }) => {
      return !graveyardContainsCards(state, dKey, ...getExodiaCards());
    },
    effect: (state, { zoneCoords }) => {
      destroyAtCoords(state, zoneCoords);
    },
    text: `${Pre.Auto}It was sent to the graveyard because there were no Exodia parts in the own graveyard.`,
  },
  [Monster.Jinzo]: {
    row: RowKey.Monster,
    condition: (state, { otherMonsters }) => {
      return hasMatchInRow(state, otherMonsters, isTrap);
    },
    effect: (state, { otherDKey }) => {
      clearAllTraps(state, otherDKey);
    },
    text: `${Pre.Auto}Destroyed all enemy traps.`,
  },
  [Monster.ExodiaTheForbiddenOne]: {
    row: RowKey.Hand,
    condition: (state, { ownHand }) => {
      return hasFullExodia(state, ownHand);
    },
    effect: (state, { dKey }) => {
      winByExodia(state, dKey);
    },
    text: `All Exodia pieces came together in the hand!`,
  },
  [Monster.TheWingedDragonOfRaPhoenixMode]: {
    row: RowKey.Graveyard,
    condition: (state, { ownMonsters }) => {
      return hasEmptyZone(state, ownMonsters);
    },
    effect: (state, { dKey }) => {
      clearGraveyard(state, dKey);
      specialSummon(state, dKey, Monster.TheWingedDragonOfRaBattleMode);
    },
    text: `${Pre.AutoGraveyard}Resurrected to own field in Battle Mode.`,
  },
  [Monster.DarkFlareKnight]: {
    row: RowKey.Graveyard,
    condition: (state, { ownMonsters }) => {
      return hasEmptyZone(state, ownMonsters);
    },
    effect: (state, { dKey }) => {
      clearGraveyard(state, dKey);
      specialSummon(state, dKey, Monster.MirageKnight);
    },
    text: `${Pre.AutoGraveyard}Summoned a Mirage Knight to the own field.`,
  },
};

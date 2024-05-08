import { RowKey } from "../enums/duel";
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
  immobiliseZone,
  isMinAtk,
  isMonster,
  isTrap,
  specialSummon,
} from "../util/zoneUtil";

const isMin1500 = (z: Zone) => isMinAtk(z, 1500);

export const customAutoEffects: CardEffectMap<AutoEffectReducer> = {
  [Spell.MessengerOfPeace]: {
    row: RowKey.SpellTrap,
    dialogue: "TODO",
    condition: (state, { ownMonsters, otherMonsters }) => {
      return (
        hasMatchInRow(state, otherMonsters, isMin1500) ||
        hasMatchInRow(state, ownMonsters, isMin1500)
      );
    },
    effect: (state, { ownMonsters, otherMonsters }) => {
      updateMonsters(state, ownMonsters, immobiliseZone, isMin1500);
      updateMonsters(state, otherMonsters, immobiliseZone, isMin1500);
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
    dialogue: "TODO",
  },
  [Monster.ExodiaNecross]: {
    row: RowKey.Monster,
    condition: (state, { dKey }) => {
      return !graveyardContainsCards(state, dKey, ...getExodiaCards());
    },
    effect: (state, { zoneCoords }) => {
      destroyAtCoords(state, zoneCoords);
    },
    dialogue: "TODO",
  },
  [Monster.Jinzo]: {
    row: RowKey.Monster,
    condition: (state, { otherMonsters }) => {
      return hasMatchInRow(state, otherMonsters, isTrap);
    },
    effect: (state, { otherDKey }) => {
      clearAllTraps(state, otherDKey);
    },
    dialogue: "TODO",
  },
  [Monster.ExodiaTheForbiddenOne]: {
    row: RowKey.Hand,
    condition: (state, { ownHand }) => {
      return hasFullExodia(state, ownHand);
    },
    effect: (state, { dKey }) => {
      winByExodia(state, dKey);
    },
    dialogue: "TODO",
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
    dialogue: "TODO",
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
    dialogue: "TODO",
  },
};

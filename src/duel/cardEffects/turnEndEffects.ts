import { RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { Trap } from "../enums/spellTrapRitual";
import { isDragon } from "../util/cardTypeUtil";
import { always } from "../util/common";
import {
  effConDi_LavaGolem_Summon,
  effect_CastleOfDarkIllusions,
} from "../util/effectsUtil";
import {
  countMatchesInRow,
  destroyFirstFound,
  hasMatchInRow,
  updateMonsters,
} from "../util/rowUtil";
import { immobiliseZone, permPowerDown } from "../util/zoneUtil";

export const turnEndEffects: CardEffectMap<AutoEffectReducer> = {
  [Trap.DragonCaptureJar]: {
    row: RowKey.SpellTrap,
    dialogue: "TODO",
    effect: (state, { otherMonsters }) => {
      updateMonsters(state, otherMonsters, immobiliseZone, isDragon);
    },
    condition: (state, { otherMonsters }) => {
      return hasMatchInRow(
        state,
        otherMonsters,
        (z) => isDragon(z) && !z.isLocked
      );
    },
  },
  [Monster.CastleOfDarkIllusions]: {
    row: RowKey.Monster,
    condition: always,
    effect: effect_CastleOfDarkIllusions,
    dialogue: "TODO",
  },
  [Monster.BerserkDragon]: {
    row: RowKey.Monster,
    condition: always,
    effect: (state, { zoneCoords }) => {
      permPowerDown(state, zoneCoords, 500, 500);
    },
    dialogue: "TODO",
  },
  [Monster.LavaGolem]: {
    row: RowKey.Hand,
    ...effConDi_LavaGolem_Summon,
  },
  [Monster.Helpoemer]: {
    row: RowKey.Graveyard,
    condition: (state, { otherHand }) => {
      return countMatchesInRow(state, otherHand) >= 3;
    },
    effect: (state, { otherHand }) => {
      // If this is in the own graveyard on the enemy's turn, and if
      // the foe has 3 or more cards in hand, the foe must discard one.
      destroyFirstFound(state, otherHand);
    },
    dialogue: "TODO",
  },
};

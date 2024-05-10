import { CardTextPrefix as Pre } from "../enums/dialogue";
import { RowKey } from "../enums/duel";
import { Spell, Trap } from "../enums/spellTrapRitual";
import { getBurnSpells, getHealSpells } from "../util/cardUtil";
import { burn } from "../util/duellistUtil";
import { countMatchesInRow, destroyRow } from "../util/rowUtil";
import { isReflectablePowerUp } from "../util/targetedSpellUtil";
import { getOriginZone, permPowerDown } from "../util/zoneUtil";

const getOriginId = (state: Duel) => getOriginZone(state).id as Spell;

export const counterSpellEffects: CardEffectMap<AutoEffectReducer> = {
  [Trap.GoblinFan]: {
    row: RowKey.SpellTrap,
    condition: (state) => {
      return getBurnSpells().includes(getOriginId(state));
    },
    effect: (state, { dKey, otherHand }) => {
      let burnAmt = 0;
      switch (getOriginId(state)) {
        case Spell.Sparks:
          burnAmt = 50;
          break;
        case Spell.Hinotama:
          burnAmt = 100;
          break;
        case Spell.FinalFlame:
          burnAmt = 200;
          break;
        case Spell.Ookazi:
          burnAmt = 500;
          break;
        case Spell.TremendousFire:
          burnAmt = 1000;
          break;
        case Spell.RestructerRevolution:
          burnAmt = countMatchesInRow(state, otherHand);
          break;
      }
      burn(state, dKey, burnAmt);
    },
    text: `${Pre.Trap}It causes LP damage.`,
  },
  [Trap.BadReactionToSimochi]: {
    row: RowKey.SpellTrap,
    condition: (state) => {
      return getHealSpells().includes(getOriginId(state));
    },
    effect: (state, { dKey }) => {
      let burnAmt = 0;
      switch (getOriginId(state)) {
        case Spell.MooyanCurry:
          burnAmt = 200;
          break;
        case Spell.RedMedicine:
          burnAmt = 500;
          break;
        case Spell.GoblinsSecretRemedy:
          burnAmt = 1000;
          break;
        case Spell.SoulOfThePure:
          burnAmt = 2000;
          break;
        case Spell.DianKetoTheCureMaster:
          burnAmt = 5000;
          break;
      }
      burn(state, dKey, burnAmt);
    },
    text: `${Pre.Trap}It causes LP damage.`,
  },
  [Trap.ReverseTrap]: {
    row: RowKey.SpellTrap,
    condition: (state) => {
      return isReflectablePowerUp(getOriginId(state));
    },
    effect: (state) => {
      permPowerDown(state, state.interaction.targetCoords!, 500, 500);
    },
    text: `${Pre.Trap}The monster is powered down.`,
  },
  [Trap.AntiRaigeki]: {
    row: RowKey.SpellTrap,
    condition: (state) => {
      return getOriginId(state) === Spell.Raigeki;
    },
    effect: (state, { ownMonsters }) => {
      destroyRow(state, ownMonsters);
    },
    text: `${Pre.Trap}All the monsters on the foe's field are destroyed instead of the player's.`,
  },
};

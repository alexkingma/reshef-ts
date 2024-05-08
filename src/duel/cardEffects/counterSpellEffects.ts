import { RowKey } from "../enums/duel";
import { Spell, Trap } from "../enums/spellTrapRitual";
import { getBurnSpells, getHealSpells } from "../util/cardUtil";
import { never } from "../util/common";
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
    dialogue: "TODO",
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
    dialogue: "TODO",
  },
  [Trap.ReverseTrap]: {
    row: RowKey.SpellTrap,
    condition: (state) => {
      return isReflectablePowerUp(getOriginId(state));
    },
    effect: (state) => {
      permPowerDown(state, state.interaction.targetCoords!, 500, 500);
    },
    dialogue: "TODO",
  },
  [Trap.FakeTrap]: {
    // never triggers, has no effect
    row: RowKey.SpellTrap,
    condition: never,
    effect: () => null,
    dialogue: "TODO",
  },
  [Trap.AntiRaigeki]: {
    row: RowKey.SpellTrap,
    condition: (state) => {
      return getOriginId(state) === Spell.Raigeki;
    },
    effect: (state, { ownMonsters }) => {
      destroyRow(state, ownMonsters);
    },
    dialogue: "TODO",
  },
};

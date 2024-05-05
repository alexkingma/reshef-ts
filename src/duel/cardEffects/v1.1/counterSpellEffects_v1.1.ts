import {
  Spell,
  SpellTrapRitual,
  Trap,
} from "@/duel/enums/spellTrapRitual_v1.0";
import { getHealSpells } from "@/duel/util/cardUtil";
import { burn } from "@/duel/util/duellistUtil";
import { getOriginZone } from "@/duel/util/zoneUtil";

export const counterSpellReducers: CardSubsetReducerMap<
  SpellTrapRitual,
  EffConReducer
> = {
  [Trap.BadReactionToSimochi]: (state, { dKey }) => {
    // same effect as v1.0, but it's continuous now
    const originZone = getOriginZone(state) as OccupiedSpellTrapZone;
    return {
      noDiscard: true,
      condition: () => {
        return getHealSpells().includes(originZone.card.id as Spell);
      },
      effect: () => {
        let burnAmt = 0;
        switch (originZone.card.id) {
          case Spell.MooyanCurry:
            burnAmt = 200;
            break;
          case Spell.RedMedicine:
            burnAmt = 500;
            break;
          case Spell.GoblinsSecretRemedy:
            burnAmt = 600;
            break;
          case Spell.SoulOfThePure:
            burnAmt = 800;
            break;
          case Spell.DianKetoTheCureMaster:
            burnAmt = 1000;
            break;
        }
        burn(state, dKey, burnAmt);
      },
    };
  },
};

import { DuellistKey, Monster, RowKey, Spell } from "@/duel/common";
import { burn } from "@/duel/util/duellistUtil";
import { burnOther, destroyRows, healSelf } from "@/duel/util/wrappedUtil";
import { transformMonster } from "@/duel/util/zoneUtil";

export const spellEffects: CardSubsetReducerMap<Spell, DirectEffectReducer> = {
  // burn
  [Spell.Sparks]: burnOther(200),
  [Spell.Hinotama]: burnOther(500),
  [Spell.FinalFlame]: burnOther(600),
  [Spell.Ookazi]: burnOther(800),
  [Spell.TremendousFire]: (state, { otherDKey, dKey }) => {
    burn(state, otherDKey, 1000);
    burn(state, dKey, 500);
  },

  // heal
  [Spell.GoblinsSecretRemedy]: healSelf(600),
  [Spell.SoulOfThePure]: healSelf(800),
  [Spell.DianKetoTheCureMaster]: healSelf(1000),

  // unsorted
  [Spell.MagicalLabyrinth]: (state, { zoneCoords }) => {
    transformMonster(state, zoneCoords, Monster.WallShadow);
  },
  [Spell.FinalDestiny]: destroyRows([
    [DuellistKey.Player, RowKey.Hand],
    [DuellistKey.Player, RowKey.SpellTrap],
    [DuellistKey.Player, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.SpellTrap],
    // doesn't destroy opp hand
  ]),
  [Spell.HeavyStorm]: destroyRows([
    [DuellistKey.Player, RowKey.SpellTrap],
    [DuellistKey.Opponent, RowKey.SpellTrap],
  ]),
};

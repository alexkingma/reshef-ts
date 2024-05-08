import SpellTargetMap from "@/assets/data/spellTargets";
import { Monster } from "../enums/monster";
import { Spell } from "../enums/spellTrapRitual";

export const spellHasTarget = (id: Spell) => {
  return id in SpellTargetMap;
};

export const isValidSpellTarget = (
  originSpell: Spell,
  targetMonster: Monster
) => {
  const validTargets = SpellTargetMap[originSpell];
  if (!validTargets) {
    console.log(`No spell targets found for card: ${originSpell}`);
    return false;
  }

  return validTargets.has(targetMonster);
};

export const isReflectablePowerUp = (id: Spell) => {
  // i.e. should it trigger Bad Reaction to Simochi
  return (
    spellHasTarget(id) &&
    ![
      // non-power-up effects
      Spell.ElegantEgotist,
      Spell.Metalmorph,
    ].includes(id)
  );
};

import {
  CardTextPrefix as Pre,
  EffectDialogueTag as Tag,
} from "../enums/dialogue";
import { RowKey } from "../enums/duel";
import { Trap } from "../enums/spellTrapRitual";
import { always } from "../util/common";
import { effect_TrapDestroyAttacker as trapDestroyAttacker } from "../util/effectsUtil";
import { destroyRow } from "../util/rowUtil";
import {
  getZone,
  immobiliseZone,
  isMaxAtk,
  permPowerDown,
} from "../util/zoneUtil";

export const counterAttackEffects: CardEffectMap<AutoEffectReducer> = {
  [Trap.AmazonArchers]: {
    row: RowKey.SpellTrap,
    condition: always,
    effect: (state) => {
      permPowerDown(state, state.interaction.originCoords!, 500, 500);
    },
    text: `${Pre.Trap}The monster is powered down.`,
  },
  [Trap.HouseOfAdhesiveTape]: trapDestroyAttacker((z) => isMaxAtk(z, 500)),
  [Trap.Eatgaboon]: trapDestroyAttacker((z) => isMaxAtk(z, 1000)),
  [Trap.BearTrap]: trapDestroyAttacker((z) => isMaxAtk(z, 1500)),
  [Trap.InvisibleWire]: trapDestroyAttacker((z) => isMaxAtk(z, 2000)),
  [Trap.AcidTrapHole]: trapDestroyAttacker((z) => isMaxAtk(z, 3000)),
  [Trap.WidespreadRuin]: trapDestroyAttacker(always),
  [Trap.TorrentialTribute]: {
    row: RowKey.SpellTrap,
    condition: always,
    effect: (state, { ownMonsters }) => {
      destroyRow(state, ownMonsters);
    },
    text: `${Pre.Trap}All monsters on the attacking side of the field will be destroyed.`,
  },
  [Trap.InfiniteDismissal]: {
    row: RowKey.SpellTrap,
    condition: always,
    effect: (state) => {
      const z = getZone(
        state,
        state.interaction.originCoords!
      ) as OccupiedMonsterZone;
      immobiliseZone(z);
    },
    text: `${Pre.Trap}${Tag.OriginZone} will be unable to move for one turn.`,
  },
};

import { RowKey } from "../enums/duel";
import { Trap } from "../enums/spellTrapRitual";
import { always } from "../util/common";
import { destroyRow } from "../util/rowUtil";
import { getEffCon_trapDestroyAttacker } from "../util/wrappedUtil";
import {
  getZone,
  immobiliseZone,
  isMinAtk,
  permPowerDown,
} from "../util/zoneUtil";

export const counterAttackEffects: CardEffectMap<AutoEffectReducer> = {
  [Trap.AmazonArchers]: {
    row: RowKey.SpellTrap,
    condition: always,
    effect: (state) => {
      permPowerDown(state, state.interaction.originCoords!, 500, 500);
    },
    dialogue: "TODO",
  },
  [Trap.HouseOfAdhesiveTape]: {
    ...getEffCon_trapDestroyAttacker((z) => isMinAtk(z, 500)),
    dialogue: "TODO",
  },
  [Trap.Eatgaboon]: {
    ...getEffCon_trapDestroyAttacker((z) => isMinAtk(z, 1000)),
    dialogue: "TODO",
  },
  [Trap.BearTrap]: {
    ...getEffCon_trapDestroyAttacker((z) => isMinAtk(z, 1500)),
    dialogue: "TODO",
  },
  [Trap.InvisibleWire]: {
    ...getEffCon_trapDestroyAttacker((z) => isMinAtk(z, 2000)),
    dialogue: "TODO",
  },
  [Trap.AcidTrapHole]: {
    ...getEffCon_trapDestroyAttacker((z) => isMinAtk(z, 3000)),
    dialogue: "TODO",
  },
  [Trap.WidespreadRuin]: {
    ...getEffCon_trapDestroyAttacker(always),
    dialogue: "TODO",
  },
  [Trap.TorrentialTribute]: {
    row: RowKey.SpellTrap,
    condition: always,
    effect: (state, { ownMonsters }) => {
      destroyRow(state, ownMonsters);
    },
    dialogue: "TODO",
  },
  [Trap.InfiniteDismissal]: {
    row: RowKey.SpellTrap,
    condition: () => true,
    effect: (state) => {
      const z = getZone(
        state,
        state.interaction.originCoords!
      ) as OccupiedMonsterZone;
      immobiliseZone(z);
    },
    dialogue: "TODO",
  },
};

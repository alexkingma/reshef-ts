import { CounterAttackTrap, Trap } from "../common";
import { destroyRow } from "../util/rowUtil";
import { trapDestroyAttacker } from "../util/wrappedUtil";
import { immobiliseCard, permPowerDown } from "../util/zoneUtil";

export const counterAttackTrapReducers: CardReducerMap<
  CounterAttackTrap,
  EffConReducer
> = {
  [Trap.AmazonArchers]: (state) => {
    return {
      condition: () => true,
      effect: () => {
        permPowerDown(state, state.interaction.originCoords!);
      },
    };
  },
  [Trap.HouseOfAdhesiveTape]: trapDestroyAttacker((z) => z.card.effAtk <= 500),
  [Trap.Eatgaboon]: trapDestroyAttacker((z) => z.card.effAtk <= 1000),
  [Trap.BearTrap]: trapDestroyAttacker((z) => z.card.effAtk <= 1500),
  [Trap.InvisibleWire]: trapDestroyAttacker((z) => z.card.effAtk <= 2000),
  [Trap.AcidTrapHole]: trapDestroyAttacker((z) => z.card.effAtk <= 3000),
  [Trap.WidespreadRuin]: trapDestroyAttacker(() => true),
  [Trap.TorrentialTribute]: (state, { ownMonsters }) => {
    return {
      condition: () => true,
      effect: () => {
        destroyRow(state, ownMonsters);
      },
    };
  },
  [Trap.InfiniteDismissal]: (state) => {
    return {
      condition: () => true,
      effect: () => {
        immobiliseCard(state, state.interaction.originCoords!);
      },
    };
  },
};

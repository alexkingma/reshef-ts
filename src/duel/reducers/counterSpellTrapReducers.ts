import { CounterSpellTrap, Spell, Trap } from "../common";
import { burn } from "../util/duellistUtil";
import { countMatchesInRow, destroyRow } from "../util/rowUtil";
import { isReflectablePowerUp } from "../util/targetedSpellUtil";
import { getOriginZone, permPowerDown } from "../util/zoneUtil";

export const counterSpellTrapReducers: CardReducerMap<
  CounterSpellTrap,
  EffConReducer
> = {
  [Trap.GoblinFan]: (state, { otherHand, dKey }) => {
    return {
      condition: () => {
        const originZone = getOriginZone(state) as OccupiedSpellTrapZone;
        return [
          Spell.Sparks,
          Spell.Hinotama,
          Spell.FinalFlame,
          Spell.Ookazi,
          Spell.TremendousFire,
          Spell.RestructerRevolution,
        ].includes(originZone.card.name as Spell);
      },
      effect: () => {
        const originZone = getOriginZone(state) as OccupiedSpellTrapZone;
        let burnAmt = 0;
        switch (originZone.card.name) {
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
    };
  },
  [Trap.BadReactionToSimochi]: (state, { dKey }) => {
    return {
      condition: () => {
        const originZone = getOriginZone(state) as OccupiedSpellTrapZone;
        return [
          Spell.MooyanCurry,
          Spell.RedMedicine,
          Spell.GoblinsSecretRemedy,
          Spell.SoulOfThePure,
          Spell.DianKetoTheCureMaster,
        ].includes(originZone.card.name as Spell);
      },
      effect: () => {
        const originZone = getOriginZone(state) as OccupiedSpellTrapZone;
        let burnAmt = 0;
        switch (originZone.card.name) {
          case Spell.MooyanCurry:
            burnAmt = 200;
            break;
          case Spell.RedMedicine:
            burnAmt = 500;
            break;
          case Spell.GoblinsSecretRemedy:
            burnAmt = 100;
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
    };
  },
  [Trap.ReverseTrap]: (state) => {
    return {
      condition: () => {
        const originZone = getOriginZone(state) as OccupiedSpellTrapZone;
        return isReflectablePowerUp(originZone.card.name);
      },
      effect: () => {
        permPowerDown(state, state.interaction.targetCoords!);
      },
    };
  },
  [Trap.FakeTrap]: () => {
    return {
      // never triggers, has no effect
      condition: () => false,
      effect: () => null,
    };
  },
  [Trap.AntiRaigeki]: (state, { ownMonsters }) => {
    return {
      condition: () => {
        const originZone = getOriginZone(state) as OccupiedSpellTrapZone;
        return originZone.card.name === Spell.Raigeki;
      },
      effect: () => {
        destroyRow(state, ownMonsters);
      },
    };
  },
};

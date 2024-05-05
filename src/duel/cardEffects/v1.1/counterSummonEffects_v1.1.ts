import { Monster } from "@/duel/enums/monster";
import { Trap } from "@/duel/enums/spellTrapRitual_v1.0";

// TODO: unused by base game, hook it up in the summonMonster reducer
export const counterSummonReducers: CardSubsetReducerMap<
  Monster | Trap,
  EffConReducer
> = {
  [Monster.SliferTheSkyDragon]: () => {
    // TODO: mon loses 2000 atk, is destroyed if atk <= 0
    return {
      condition: () => {
        return false;
      },
      effect: () => {},
    };
  },
  [Trap.HouseOfAdhesiveTape]: () => {
    // TODO: If the DEF of a monster summoned by your opponent
    // is 500 points or less, the monster is destroyed.
    return {
      condition: () => {
        return false;
      },
      effect: () => {},
    };
  },
  [Trap.GoblinFan]: () => {
    // TODO: When a Level 2 or lower monster is Flip Summoned, destroy it
    return {
      noDiscard: true,
      condition: () => {
        return false;
      },
      effect: () => {},
    };
  },
  [Trap.Eatgaboon]: () => {
    // TODO: ATK <= 500, destroyed
    return {
      condition: () => {
        return false;
      },
      effect: () => {},
    };
  },
};

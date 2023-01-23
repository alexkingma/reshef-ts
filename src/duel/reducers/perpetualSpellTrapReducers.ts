import {
  Monster,
  Orientation,
  PerpetualSpellTrap,
  Spell,
  Trap,
} from "../common";
import { burn, isStartOfTurn } from "../util/duellistUtil";
import {
  hasEmptyZone,
  hasMatchInRow,
  rowContainsAnyCards,
  updateMonsters,
} from "../util/rowUtil";
import { getEffCon_requireDestinyBoard } from "../util/wrappedUtil";
import {
  isMonster,
  isType,
  setSpellTrap,
  specialSummon,
} from "../util/zoneUtil";

export const perpetualSpellTrapReducers: CardReducerMap<
  PerpetualSpellTrap,
  MultiEffConReducer
> = {
  [Spell.MessengerOfPeace]: (state, { dKey, ownMonsters, otherMonsters }) => {
    const is1500 = (z: OccupiedZone) => isMonster(z) && z.card.effAtk >= 1500;
    return [
      {
        // activates on player's next turn regardless of
        // if there is a 1500+ on the field
        condition: () => isStartOfTurn(state, dKey),
        effect: () => burn(state, dKey, 1000),
      },
      {
        condition: () => {
          return (
            hasMatchInRow(state, otherMonsters, is1500) ||
            hasMatchInRow(state, ownMonsters, is1500)
          );
        },
        effect: () => {
          updateMonsters(
            state,
            otherMonsters,
            (z) => (z.isLocked = true),
            is1500
          );
        },
      },
    ];
  },
  [Spell.JamBreedingMachine]: (state, { dKey }) => {
    return [
      {
        condition: () => isStartOfTurn(state, dKey),
        effect: () => {
          // player is prevented from summoning, even if the
          // special summon fails due to no free zones
          specialSummon(state, dKey, Monster.ChangeSlime);
          state.activeTurn.hasNormalSummoned = true;
        },
      },
    ];
  },
  [Trap.DragonCaptureJar]: (state, { otherMonsters }) => {
    return [
      {
        condition: () => {
          return hasMatchInRow(
            state,
            otherMonsters,
            (z) => isType(z, "Dragon") && !z.isLocked
          );
        },
        effect: () => {
          updateMonsters(
            state,
            otherMonsters,
            (z) => (z.isLocked = true),
            (z) => isType(z, "Dragon")
          );
        },
      },
    ];
  },
  [Trap.DestinyBoard]: (state, { dKey, ownSpellTrap }) => {
    return [
      {
        condition: () => {
          return (
            isStartOfTurn(state, dKey) && hasEmptyZone(state, ownSpellTrap)
          );
        },
        effect: () => {
          // The letters are always added in order, so you know which card
          // comes next based on the first letter that isn't in the row.
          const letters = [
            Trap.SpiritMessageI,
            Trap.SpiritMessageN,
            Trap.SpiritMessageA,
            Trap.SpiritMessageL,
          ];
          for (const letter of letters) {
            if (!rowContainsAnyCards(state, ownSpellTrap, letter)) {
              setSpellTrap(state, dKey, letter, {
                orientation: Orientation.FaceUp,
              });
              // TODO: if the letter added was L, set the isVictor flag

              // only add one letter per turn
              return;
            }
          }
        },
      },
    ];
  },
  [Trap.SpiritMessageI]: getEffCon_requireDestinyBoard(),
  [Trap.SpiritMessageN]: getEffCon_requireDestinyBoard(),
  [Trap.SpiritMessageA]: getEffCon_requireDestinyBoard(),
  [Trap.SpiritMessageL]: getEffCon_requireDestinyBoard(),
};

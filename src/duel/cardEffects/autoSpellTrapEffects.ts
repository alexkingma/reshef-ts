import { Orientation } from "../enums/duel";
import { Monster } from "../enums/monster";
import { AutoSpellTrap, Spell, Trap } from "../enums/spellTrapRitual_v1.0";
import { isDragon } from "../util/cardTypeUtil";
import { getFinalCards } from "../util/cardUtil";
import { burn, isStartOfTurn, winByFINAL } from "../util/duellistUtil";
import {
  hasEmptyZone,
  hasMatchInRow,
  rowContainsAnyCards,
  updateMonsters,
} from "../util/rowUtil";
import { getEffCon_requireDestinyBoard } from "../util/wrappedUtil";
import { isMonster, setSpellTrap, specialSummon } from "../util/zoneUtil";

export const autoSpellTrapEffects: CardReducerMap<
  AutoSpellTrap,
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
  [Trap.DragonCaptureJar]: (state, { otherDKey, otherMonsters }) => {
    return [
      {
        condition: () => {
          return (
            isStartOfTurn(state, otherDKey) &&
            hasMatchInRow(
              state,
              otherMonsters,
              (z) => isDragon(z) && !z.isLocked
            )
          );
        },
        effect: () => {
          updateMonsters(
            state,
            otherMonsters,
            (z) => (z.isLocked = true),
            (z) => isDragon(z)
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
          for (const letter of getFinalCards()) {
            // letter already on board
            if (rowContainsAnyCards(state, ownSpellTrap, letter)) continue;

            setSpellTrap(state, dKey, letter, {
              orientation: Orientation.FaceUp,
            });

            if (letter === Trap.SpiritMessageL) {
              // the FINAL message is complete
              winByFINAL(state, dKey);
            }

            // only add one letter per turn
            return;
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

import { Orientation, PerpetualTrap, Trap } from "../common";
import { ZoneCoordsMap } from "../duelSlice";
import { isStartOfTurn } from "../util/duellistUtil";
import {
  hasEmptyZone,
  hasMatchInRow,
  rowContainsAnyCards,
  updateMatchesInRow,
} from "../util/rowUtil";
import { getEffCon_requireDestinyBoard } from "../util/wrappedUtil";
import { isType, setSpellTrap } from "../util/zoneUtil";

type TrapEffectReducer = (
  state: Duel,
  coords: ZoneCoordsMap
) => {
  condition: () => boolean;
  effect: () => void;
}[];

type TrapEffectReducers = {
  [key in PerpetualTrap]: TrapEffectReducer;
};

export const perpetualTrapReducers: TrapEffectReducers = {
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
          updateMatchesInRow(
            state,
            otherMonsters,
            (z) => isType(z, "Dragon"),
            (z) => (z.isLocked = true)
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

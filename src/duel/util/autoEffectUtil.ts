import { graveyardEffects } from "../cardEffects/autoGraveyardEffects";
import { handEffects } from "../cardEffects/autoHandEffects";
import { autoMonsterEffects } from "../cardEffects/autoMonsterEffects";
import { autoSpellTrapEffects } from "../cardEffects/autoSpellTrapEffects";
import { tempMonsterEffects } from "../cardEffects/tempMonsterEffects";
import { Orientation, RowKey } from "../common";
import { getOtherDuellistKey } from "./duellistUtil";
import { getRow, updateMonsters } from "./rowUtil";
import { getCombatStats, getZone, getZoneCoordsMap } from "./zoneUtil";

export const checkAutoEffects = (state: Duel) => {
  // Temp power-up effects are separate from perm (but still auto) effects.
  // Temp power-ups must be calculated first so that the perm
  // effects can accurately deduce the "strongest" card, etc.
  // Then, once permanent effects (destruction, spec. summoning, etc.)
  // are complete, temp power-ups should be recalculated one final time.
  recalcCombatStats(state);
  checkPermAutoEffects(state);
  recalcCombatStats(state);
};

const recalcCombatStats = (state: Duel) => {
  const dKey = state.activeTurn.duellistKey;
  const otherDKey = getOtherDuellistKey(dKey);

  resetRowCombatStats(state, dKey);
  resetRowCombatStats(state, otherDKey);

  checkRowEffects(state, [dKey, RowKey.Monster], tempMonsterEffects);
  checkRowEffects(state, [otherDKey, RowKey.Monster], tempMonsterEffects);

  calcRowCombatStats(state, [dKey, RowKey.Monster]);
  calcRowCombatStats(state, [otherDKey, RowKey.Monster]);

  // Update the hand monster effAtk/effDef in case field has changed.
  // No "reset" call is needed since we never power up or down hand monsters.
  calcRowCombatStats(state, [dKey, RowKey.Hand]);
  calcRowCombatStats(state, [otherDKey, RowKey.Hand]);
};

const calcRowCombatStats = (state: Duel, rowCoords: RowCoords) => {
  updateMonsters(state, rowCoords, (_, i) => {
    calcZoneCombatStats(state, [...rowCoords, i]);
  });
};

const resetRowCombatStats = (state: Duel, dKey: DuellistKey) => {
  const rowCoords: RowCoords = [dKey, RowKey.Monster];
  updateMonsters(state, rowCoords, (z, i) => {
    z.tempPowerUpLevel = 0;
    calcZoneCombatStats(state, [...rowCoords, i]);
  });
};

const calcZoneCombatStats = (state: Duel, zoneCoords: ZoneCoords) => {
  const zone = getZone(state, zoneCoords) as OccupiedMonsterZone;
  zone.card = {
    ...zone.card,
    ...getCombatStats(state, zoneCoords),
  };
};

const checkPermAutoEffects = (state: Duel) => {
  const dKey = state.activeTurn.duellistKey;
  const otherDKey = getOtherDuellistKey(dKey);

  // graveyard effects
  checkRowEffects(state, [dKey, RowKey.Graveyard], graveyardEffects);
  checkRowEffects(state, [otherDKey, RowKey.Graveyard], graveyardEffects);

  // monster (perm) effects
  checkRowEffects(state, [dKey, RowKey.Monster], autoMonsterEffects);
  checkRowEffects(state, [otherDKey, RowKey.Monster], autoMonsterEffects);

  // spell/trap effects
  checkRowEffects(state, [dKey, RowKey.SpellTrap], autoSpellTrapEffects);
  checkRowEffects(state, [otherDKey, RowKey.SpellTrap], autoSpellTrapEffects);

  // hand effects
  checkRowEffects(state, [dKey, RowKey.Hand], handEffects);
  checkRowEffects(state, [otherDKey, RowKey.Hand], handEffects);
};

const checkRowEffects = <T extends CardName>(
  state: Duel,
  rowCoords: RowCoords,
  reducerMap: CardReducerMap<T, MultiEffConReducer>
) => {
  getRow(state, rowCoords).forEach((_: any, i: number) => {
    const coordsMap = getZoneCoordsMap([...rowCoords, i]);
    const { zoneCoords } = coordsMap;

    const zone = getZone(state, zoneCoords);
    if (!zone.isOccupied) return;

    const reducer = reducerMap[zone.card.name as T];
    if (!reducer) return;

    const conEffectPairs = reducer(state, coordsMap);
    conEffectPairs.forEach(({ condition, effect }) => {
      if (!condition(state, coordsMap)) return;

      zone.orientation = Orientation.FaceUp;
      effect(state, coordsMap);
    });
  });
};

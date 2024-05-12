import { customAutoEffects } from "../cardEffects/customAutoEffects";
import { tempMonsterEffects } from "../cardEffects/tempMonsterEffects";
import { turnEndEffects } from "../cardEffects/turnEndEffects";
import { turnStartEffects } from "../cardEffects/turnStartEffects";
import { DKey, Orientation, RowKey } from "../enums/duel";
import { logEffectMessage } from "../util/logUtil";
import { mergeMapsAndValues } from "./common";
import { getOtherDuellistKey, isStartOfTurn } from "./duellistUtil";
import { getRow, isRowCoordMatch, updateMonsters } from "./rowUtil";
import {
  getCombatStats,
  getZone,
  getZoneCoordsMap,
  isOccupied,
} from "./zoneUtil";

const includeTurnStartEffects = mergeMapsAndValues(
  turnStartEffects,
  customAutoEffects
);
const includeTurnEndEffects = mergeMapsAndValues(
  turnEndEffects,
  customAutoEffects
);

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
  const dKey = state.activeTurn.dKey;
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

const resetRowCombatStats = (state: Duel, dKey: DKey) => {
  const rowCoords: RowCoords = [dKey, RowKey.Monster];
  updateMonsters(state, rowCoords, (z, i) => {
    z.tempPowerUpAtk = 0;
    z.tempPowerUpDef = 0;
    calcZoneCombatStats(state, [...rowCoords, i]);
  });
};

const calcZoneCombatStats = (state: Duel, zoneCoords: ZoneCoords) => {
  const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
  const { effAtk, effDef } = getCombatStats(state, zoneCoords);
  z.effAtk = effAtk;
  z.effDef = effDef;
};

const checkPermAutoEffects = (state: Duel) => {
  const dKey = state.activeTurn.dKey;
  const otherDKey = getOtherDuellistKey(dKey);
  const relevantEffects = isStartOfTurn(state, dKey)
    ? includeTurnStartEffects
    : isStartOfTurn(state, otherDKey)
      ? includeTurnEndEffects
      : customAutoEffects;
  const orderedRows: RowCoords[] = [
    [dKey, RowKey.Graveyard],
    [otherDKey, RowKey.Graveyard],
    [dKey, RowKey.Monster],
    [otherDKey, RowKey.Monster],
    [dKey, RowKey.SpellTrap],
    [otherDKey, RowKey.SpellTrap],
    [dKey, RowKey.Hand],
    [otherDKey, RowKey.Hand],
  ];
  orderedRows.forEach((rowCoords) => {
    checkRowEffects(state, rowCoords, relevantEffects);
  });
};

const checkRowEffects = (
  state: Duel,
  rowCoords: RowCoords,
  reducerMap: CardEffectMap<AutoEffectReducer>
) => {
  getRow(state, rowCoords).forEach((_, i: number) => {
    const coordsMap = getZoneCoordsMap([...rowCoords, i]);
    const { zoneCoords, dKey } = coordsMap;

    const z = getZone(state, zoneCoords);
    if (!isOccupied(z)) return;

    const temp = reducerMap[z.id];
    if (!temp) return;

    const effects = Array.isArray(temp) ? temp : [temp];
    effects.forEach(({ row, condition, effect, text }) => {
      // auto effects only activate in specific rows
      if (!isRowCoordMatch(rowCoords, [dKey, row as RowKey])) return;
      // if condition doesn't exist, it's an "always" effect
      if (condition && !condition(state, coordsMap)) return;
      // TODO: only log this once, not every time we re-update the duel state
      logEffectMessage(state, zoneCoords, text);

      z.orientation = Orientation.FaceUp;
      effect(state, coordsMap);
    });
  });
};

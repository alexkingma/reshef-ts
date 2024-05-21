import { customAutoEffects } from "../cardEffects/customAutoEffects";
import { tempMonsterEffects } from "../cardEffects/tempMonsterEffects";
import { turnEndEffects } from "../cardEffects/turnEndEffects";
import { turnStartEffects } from "../cardEffects/turnStartEffects";
import { DKey, Orientation, RowKey } from "../enums/duel";
import { logEffectMessage } from "../util/logUtil";
import { mergeMapsAndValues } from "./common";
import { isStartOfTurn, setOriginTarget } from "./duellistUtil";
import { getRow, updateMonsters } from "./rowUtil";
import { getCombatStats, getZone, isEmpty } from "./zoneUtil";

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
  const {
    dKey,
    otherDKey,
    ownMonsters,
    otherMonsters,
    ownHand,
    otherHand,
    ownGraveyard,
    otherGraveyard,
  } = state.activeTurn;

  resetRowCombatStats(state, dKey);
  resetRowCombatStats(state, otherDKey);

  checkRowEffects(state, ownMonsters, tempMonsterEffects);
  checkRowEffects(state, otherMonsters, tempMonsterEffects);

  calcRowCombatStats(state, ownMonsters);
  calcRowCombatStats(state, otherMonsters);

  // Update the hand monster effAtk/effDef in case field has changed.
  // No "reset" call is needed since we never power up or down hand monsters.
  calcRowCombatStats(state, ownHand);
  calcRowCombatStats(state, otherHand);

  // purely for visual purposes, to not have blank atk/def
  calcRowCombatStats(state, ownGraveyard);
  calcRowCombatStats(state, otherGraveyard);
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
  const {
    dKey,
    otherDKey,
    ownGraveyard,
    otherGraveyard,
    ownMonsters,
    otherMonsters,
    ownSpellTrap,
    otherSpellTrap,
    ownHand,
    otherHand,
  } = state.activeTurn;
  const relevantEffects = isStartOfTurn(state, dKey)
    ? includeTurnStartEffects
    : isStartOfTurn(state, otherDKey)
      ? includeTurnEndEffects
      : customAutoEffects;
  const orderedRows: RowCoords[] = [
    ownGraveyard,
    otherGraveyard,
    ownMonsters,
    otherMonsters,
    ownSpellTrap,
    otherSpellTrap,
    ownHand,
    otherHand,
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
    const originCoords: ZoneCoords = [...rowCoords, i];

    const z = getZone(state, originCoords);
    if (isEmpty(z)) return;

    const temp = reducerMap[z.id];
    if (!temp) return;

    const effects = Array.isArray(temp) ? temp : [temp];
    effects.forEach(({ row, condition, effect, text }) => {
      // auto effects only activate in specific rows
      if (rowCoords[1] !== row) return;

      // if condition doesn't exist, it's an "always" effect
      if (condition && !condition(state, state.activeTurn)) return;

      // an effect is guaranteed to happen at this point
      setOriginTarget(state, { originCoords });
      // TODO: only log this once, not every time we re-update the duel state
      logEffectMessage(state, originCoords, text);

      z.orientation = Orientation.FaceUp;
      effect(state, state.activeTurn);
    });
  });
};

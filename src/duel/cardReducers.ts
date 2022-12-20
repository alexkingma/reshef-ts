import {
  attackMonster,
  clearZone,
  destroyAtCoords,
  directAttack,
} from "./cardEffectUtil";
import {
  BattlePosition,
  ManualEffectMonster,
  Orientation,
  Spell,
} from "./common";
import { StateMap, ZoneCoordsMap } from "./duelSlice";
import {
  generateOccupiedMonsterZone,
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
} from "./duelUtil";
import { monsterEffectReducers as monsterManualEffectReducers } from "./monsterManualEffectReducers";
import { spellEffectReducers } from "./spellEffectReducers";

export const cardReducers = {
  normalSummon: (
    { state, originatorState, activeTurn }: StateMap,
    { zoneCoords, ownMonsters, colIdx }: ZoneCoordsMap
  ) => {
    // remove monster from hand at given index, summon it to the field
    const zoneIdx = getFirstEmptyZoneIdx(state, ownMonsters, true);
    const { card } = originatorState.hand[colIdx] as OccupiedMonsterZone;
    clearZone(state, zoneCoords);
    originatorState.monsterZones[zoneIdx] = {
      ...generateOccupiedMonsterZone(card.name),
      orientation: Orientation.FaceDown,
    };
    activeTurn.hasNormalSummoned = true;
  },
  setSpellTrap: (
    { state, originatorState }: StateMap,
    { zoneCoords, ownSpellTrap, colIdx }: ZoneCoordsMap
  ) => {
    // remove spell/trap from hand at given index, set it on the field
    const zoneIdx = getFirstEmptyZoneIdx(state, ownSpellTrap, true);
    const { card } = originatorState.hand[colIdx] as OccupiedSpellTrapZone;
    clearZone(state, zoneCoords);
    originatorState.spellTrapZones[zoneIdx] = {
      isOccupied: true,
      card,
      orientation: Orientation.FaceDown,
    };
  },
  attack: (
    { state, originatorState, targetState }: StateMap,
    { colIdx: attackerIdx, otherMonsters, zoneCoords }: ZoneCoordsMap
  ) => {
    const attackerZone = originatorState.monsterZones[
      attackerIdx
    ] as OccupiedMonsterZone;
    attackerZone.battlePosition = BattlePosition.Attack;
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) {
      // no monsters, attack directly
      directAttack(originatorState, targetState, attackerIdx);
    } else {
      attackMonster(state, zoneCoords, [...otherMonsters, targetIdx]);
    }
    attackerZone.isLocked = true;
  },
  defend: (
    { originatorState }: StateMap,
    { colIdx: monsterIdx }: ZoneCoordsMap
  ) => {
    const zone = originatorState.monsterZones[
      monsterIdx
    ] as OccupiedMonsterZone;
    zone.battlePosition = BattlePosition.Defence;
  },
  tribute: ({ state, activeTurn }: StateMap, { zoneCoords }: ZoneCoordsMap) => {
    destroyAtCoords(state, zoneCoords);
    activeTurn.numTributedMonsters++;
  },
  discard: ({ state }: StateMap, { zoneCoords }: ZoneCoordsMap) => {
    destroyAtCoords(state, zoneCoords);
  },
  activateSpellEffect: (stateMap: StateMap, coordsMap: ZoneCoordsMap) => {
    const { state, originatorState } = stateMap;
    const { zoneCoords, colIdx: spellIdx } = coordsMap;
    const { card } = originatorState.spellTrapZones[
      spellIdx
    ] as OccupiedSpellTrapZone;
    const spellDispatch = spellEffectReducers[card.name as Spell];
    if (!spellDispatch) {
      console.log(`Spell effect not implemented for card: ${card.name}`);
      return;
    }
    spellDispatch(stateMap, coordsMap);

    // discard after activation
    clearZone(state, zoneCoords);
  },
  activateManualMonsterEffect: (
    stateMap: StateMap,
    coordsMap: ZoneCoordsMap
  ) => {
    const { originatorState } = stateMap;
    const { colIdx: monsterIdx } = coordsMap;
    const { card } = originatorState.monsterZones[
      monsterIdx
    ] as OccupiedMonsterZone;
    const monsterManualEffectDispatch =
      monsterManualEffectReducers[card.name as ManualEffectMonster];

    if (!monsterManualEffectDispatch) {
      console.log(`Monster effect not implemented for card: ${card.name}`);
      return;
    }

    if (monsterManualEffectDispatch) {
      monsterManualEffectDispatch(stateMap, coordsMap);
    }

    // lock card once effect is complete
    const zonePostEffect = originatorState.monsterZones[monsterIdx];
    if (zonePostEffect.isOccupied && zonePostEffect.card.name === card.name) {
      // only lock card if the monster is the same one as before the effect
      // cards that destroy themselves or summon other monsters
      // ... in their idx usually do not need to be locked, and should
      // ... be addressed case-by -case in individual reducers
      zonePostEffect.isLocked = true;
    }
  },
};

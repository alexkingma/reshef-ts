import {
  attackMonster,
  clearZone,
  destroyAtCoords,
  directAttack,
  specialSummon,
} from "./cardEffectUtil";
import {
  BattlePosition,
  ManualEffectMonster,
  Orientation,
  Spell,
} from "./common";
import { StateMap, ZoneCoordsMap } from "./duelSlice";
import {
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
  getZone,
  postMonsterManualAction,
} from "./duelUtil";
import { monsterManualEffectReducers } from "./monsterManualEffectReducers";
import { spellEffectReducers } from "./spellEffectReducers";

export const cardReducers = {
  normalSummon: (
    { state, activeTurn }: StateMap,
    { zoneCoords, dKey }: ZoneCoordsMap
  ) => {
    const { card, orientation } = getZone(
      state,
      zoneCoords
    ) as OccupiedMonsterZone;
    specialSummon(state, dKey, card.name, { orientation });
    clearZone(state, zoneCoords);
    activeTurn.hasNormalSummoned = true;
  },
  setSpellTrap: (
    { state, originatorState }: StateMap,
    { zoneCoords, ownSpellTrap, colIdx }: ZoneCoordsMap
  ) => {
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
    const { state } = stateMap;
    const { zoneCoords } = coordsMap;
    const originalZone = getZone(state, zoneCoords) as OccupiedMonsterZone;
    const originalCardName = originalZone.card.name;
    const monsterManualEffectDispatch =
      monsterManualEffectReducers[originalCardName as ManualEffectMonster];

    if (!monsterManualEffectDispatch) {
      console.log(
        `Monster effect not implemented for card: ${originalCardName}`
      );
      return;
    }

    if (monsterManualEffectDispatch) {
      monsterManualEffectDispatch(stateMap, coordsMap);

      // lock/flip/etc.
      postMonsterManualAction(state, zoneCoords, originalCardName);
    }
  },
};

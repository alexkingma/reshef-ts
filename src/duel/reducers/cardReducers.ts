import {
  BattlePosition,
  CounterAttackTrap,
  CounterSpellTrap,
  DirectSpell,
  FlipEffectMonster,
  Orientation,
} from "../common";
import { getActiveEffects, removeBrainControlZone } from "../util/duellistUtil";
import { getRow } from "../util/rowUtil";
import {
  attackMonster,
  clearZone,
  destroyAtCoords,
  directAttack,
  getZone,
  postDirectMonsterAction,
  setSpellTrapAtCoords,
  specialSummonAtCoords,
} from "../util/zoneUtil";
import { counterAttackTrapReducers } from "./counterAttackTrapReducers";
import { counterSpellTrapReducers } from "./counterSpellTrapReducers";
import { spellEffectReducers as spellReducers } from "./directSpellReducers";
import { monsterFlipEffectReducers as flipReducers } from "./monsterFlipEffectReducers";

export const cardReducers = {
  normalSummon: (state: Duel) => {
    const { originCoords, targetCoords } = state.interaction;
    const { card, orientation } = getZone(
      state,
      originCoords!
    ) as OccupiedMonsterZone;
    clearZone(state, originCoords!);

    // summoning a monster over the top of a BC-ed monster resets
    // the flag, so that the newly summoned monster doesn't get
    // "unconverted" come turn end and wind up in the opponent's hands
    removeBrainControlZone(state, targetCoords!);

    specialSummonAtCoords(state, targetCoords!, card.name, { orientation });
    state.activeTurn.hasNormalSummoned = true;
  },
  setSpellTrap: (state: Duel) => {
    const { originCoords, targetCoords } = state.interaction;
    const { card, orientation } = getZone(state, originCoords!) as OccupiedZone;
    clearZone(state, originCoords!);
    setSpellTrapAtCoords(state, targetCoords!, card.name, { orientation });
  },
  attack: (state: Duel, coordsMap: ZoneCoordsMap) => {
    const { otherSpellTrap, otherDKey } = coordsMap;
    const { originCoords, targetCoords } = state.interaction;
    const { sorlTurnsRemaining } = getActiveEffects(state, otherDKey);
    const attackerZone = getZone(state, originCoords!) as OccupiedMonsterZone;
    attackerZone.battlePosition = BattlePosition.Attack;
    attackerZone.orientation = Orientation.FaceUp;
    attackerZone.isLocked = true;

    // SoRL is active, no attacks permitted
    // however, we still want to let the player click attack,
    // so as to set their monsters in attack position
    if (sorlTurnsRemaining !== 0) return;

    // check if any opponent traps are triggered
    for (const [trapIdx, z] of getRow(state, otherSpellTrap).entries()) {
      if (!z.isOccupied) continue;
      if (z.card.category === "Trap") {
        const reducer =
          counterAttackTrapReducers[z.card.name as CounterAttackTrap];
        if (!reducer) continue;

        const { condition, effect } = reducer(state, coordsMap);
        if (condition()) {
          // a trap triggering cancels the attack attempt and
          // carries out the trap's effect instead
          effect(state, coordsMap);
          clearZone(state, [...otherSpellTrap, trapIdx] as ZoneCoords);
          return;
        }
      }
    }

    // no traps found, continue with the original attack
    if (!targetCoords) {
      // no monsters, attack directly
      directAttack(state, originCoords!);
    } else {
      attackMonster(state, originCoords!, targetCoords);
    }
  },
  defend: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
    const zone = getZone(state, zoneCoords) as OccupiedMonsterZone;
    zone.battlePosition = BattlePosition.Defence;
  },
  tribute: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
    destroyAtCoords(state, zoneCoords);
    state.activeTurn.numTributedMonsters++;

    // tributing a BC-ed monster removes the BC flag from that zone
    removeBrainControlZone(state, zoneCoords);
  },
  discard: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
    destroyAtCoords(state, zoneCoords);

    // discarding a BC-ed monster removes the BC flag from that zone
    removeBrainControlZone(state, zoneCoords);
  },
  activateSpellEffect: (state: Duel, coordsMap: ZoneCoordsMap) => {
    const { zoneCoords, otherSpellTrap } = coordsMap;
    const { card } = getZone(state, zoneCoords) as OccupiedSpellTrapZone;
    const spellReducer = spellReducers[card.name as DirectSpell];
    if (!spellReducer) {
      console.log(`Spell effect not implemented for card: ${card.name}`);
      return;
    }

    // check if any opponent traps are triggered
    for (const [trapIdx, z] of getRow(state, otherSpellTrap).entries()) {
      if (!z.isOccupied) continue;
      if (z.card.category === "Trap") {
        const reducer =
          counterSpellTrapReducers[z.card.name as CounterSpellTrap];
        if (!reducer) continue;

        const { condition, effect } = reducer(state, coordsMap);
        if (condition()) {
          // a trap triggering cancels the spell activation
          // attempt and carries out the trap's effect instead
          effect(state, coordsMap);
          clearZone(state, [...otherSpellTrap, trapIdx] as ZoneCoords);
          clearZone(state, zoneCoords);
          return;
        }
      }
    }

    // no traps triggered, activate original spell effect
    spellReducer(state, coordsMap);

    // discard after activation
    clearZone(state, zoneCoords);
  },
  activateMonsterFlipEffect: (state: Duel, coordsMap: ZoneCoordsMap) => {
    const { zoneCoords } = coordsMap;
    const originalZone = getZone(state, zoneCoords) as OccupiedMonsterZone;
    const originalCardName = originalZone.card.name as FlipEffectMonster;
    const flipReducer = flipReducers[originalCardName];

    if (!flipReducer) {
      console.log(`Flip effect not implemented for card: ${originalCardName}`);
      return;
    }

    if (flipReducer) {
      flipReducer(state, coordsMap);

      // lock/flip/etc.
      postDirectMonsterAction(state, zoneCoords, originalCardName);
    }
  },
};

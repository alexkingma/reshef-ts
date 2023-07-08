import {
  BattlePosition,
  DirectSpell,
  FlipEffectMonster,
  Orientation,
} from "../common";
import { getActiveEffects, removeBrainControlZone } from "../util/duellistUtil";
import { checkTriggeredTraps } from "../util/rowUtil";
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
    const { otherDKey } = coordsMap;
    const { originCoords, targetCoords } = state.interaction;
    const { sorlTurnsRemaining } = getActiveEffects(state, otherDKey);
    const attackerZone = getZone(state, originCoords!) as OccupiedMonsterZone;
    attackerZone.battlePosition = BattlePosition.Attack;
    attackerZone.orientation = Orientation.FaceUp;
    attackerZone.isLocked = true;

    // SoRL is active, no attacks permitted.
    // However, we still want to let the player click attack
    // so as to set their monster in attack position.
    if (sorlTurnsRemaining !== 0) return;

    // a trap triggering cancels the attack attempt and
    // carries out the trap's effect instead
    if (checkTriggeredTraps(state, coordsMap, counterAttackTrapReducers)) {
      return;
    }

    // no traps triggered, continue with the original attack
    if (!targetCoords) {
      // no monsters, attack directly
      directAttack(state, originCoords!);
    } else {
      attackMonster(state, originCoords!, targetCoords);
    }
  },
  setDefencePos: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
    const zone = getZone(state, zoneCoords) as OccupiedMonsterZone;
    zone.battlePosition = BattlePosition.Defence;
    zone.isLocked = true;
  },
  setAttackPos: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
    const zone = getZone(state, zoneCoords) as OccupiedMonsterZone;
    zone.battlePosition = BattlePosition.Attack;
    zone.isLocked = true;
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
    const { zoneCoords } = coordsMap;
    const { card } = getZone(state, zoneCoords) as OccupiedSpellTrapZone;
    const spellReducer = spellReducers[card.name as DirectSpell];
    if (!spellReducer) {
      console.log(`Spell effect not implemented for card: ${card.name}`);
      return;
    }

    // a trap triggering cancels the spell activation attempt
    // and carries out the trap's effect instead
    if (checkTriggeredTraps(state, coordsMap, counterSpellTrapReducers)) {
      return;
    }

    // no traps triggered, activate original spell effect
    console.log(`%c${card.name}`, "color: #39A24E;");
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
      console.log(`%c${originalCardName}`, "color: #D45420;");
      flipReducer(state, coordsMap);

      // lock/flip/etc.
      postDirectMonsterAction(state, zoneCoords, originalCardName);
    }
  },
};

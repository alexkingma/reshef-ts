import { counterAttackEffects } from "../cardEffects/counterAttackEffects";
import { counterSpellEffects } from "../cardEffects/counterSpellEffects";
import { spellEffects } from "../cardEffects/directSpellEffects";
import { flipEffects } from "../cardEffects/flipEffects";
import { BattlePosition, Orientation } from "../enums/duel";
import { getCard } from "../util/cardUtil";
import { clearConvertedZoneFlag, getActiveEffects } from "../util/duellistUtil";
import { logEffectMessage } from "../util/logUtil";
import { checkTriggeredTraps } from "../util/rowUtil";
import {
  attackMonster,
  clearZone,
  destroyAtCoords,
  directAttack,
  getZone,
  postDirectMonsterAction,
  setCardAtCoords,
  summonAtCoords,
} from "../util/zoneUtil";

export const cardReducers = {
  normalSummon: (state: Duel) => {
    const { originCoords, targetCoords } = state.interaction;
    const { id, orientation } = getZone(
      state,
      originCoords!
    ) as OccupiedMonsterZone;
    clearZone(state, originCoords!);

    // summoning a monster over the top of a BC-ed monster resets
    // the flag, so that the newly summoned monster doesn't get
    // "unconverted" come turn end and wind up in the opponent's hands
    clearConvertedZoneFlag(state, targetCoords!);

    summonAtCoords(state, targetCoords!, id, { orientation });
    state.activeTurn.hasNormalSummoned = true;
  },
  setSpellTrap: (state: Duel) => {
    const { originCoords, targetCoords } = state.interaction;
    const { id, orientation } = getZone(state, originCoords!) as OccupiedZone;
    clearZone(state, originCoords!);
    setCardAtCoords(state, targetCoords!, id, { orientation });
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
    if (checkTriggeredTraps(state, coordsMap, counterAttackEffects)) {
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
    const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
    z.battlePosition = BattlePosition.Defence;
    z.isLocked = true;
  },
  setAttackPos: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
    const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
    z.battlePosition = BattlePosition.Attack;
    z.isLocked = true;
  },
  tribute: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
    destroyAtCoords(state, zoneCoords, true);
    state.activeTurn.numTributedMonsters++;

    // tributing a BC-ed monster removes the BC flag from that zone
    clearConvertedZoneFlag(state, zoneCoords);
  },
  discard: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
    destroyAtCoords(state, zoneCoords, true);

    // discarding a BC-ed monster removes the BC flag from that zone
    clearConvertedZoneFlag(state, zoneCoords);
  },
  activateSpellEffect: (state: Duel, coordsMap: ZoneCoordsMap) => {
    const { zoneCoords } = coordsMap;
    const { id } = getZone(state, zoneCoords) as OccupiedSpellTrapZone;
    const { name } = getCard(id);
    const spellReducer = spellEffects[id];
    if (!spellReducer) {
      console.error(`Effect not implemented for direct spell: ${name}`);
      return;
    } else if (Array.isArray(spellReducer)) {
      console.error(`Multiple effects found for direct spell: ${name}`);
      return;
    }

    // a trap triggering cancels the spell activation attempt
    // and carries out the trap's effect instead
    if (checkTriggeredTraps(state, coordsMap, counterSpellEffects)) {
      return;
    }

    // no traps triggered, activate original spell effect
    const { effect, text, noDiscard } = spellReducer;
    logEffectMessage(state, zoneCoords, text);
    effect(state, coordsMap);

    if (!noDiscard) {
      // discard after activation
      clearZone(state, zoneCoords);
    }
  },
  activateMonsterFlipEffect: (state: Duel, coordsMap: ZoneCoordsMap) => {
    const { zoneCoords } = coordsMap;
    const { id } = getZone(state, zoneCoords) as OccupiedMonsterZone;
    const { name } = getCard(id);
    const flipReducer = flipEffects[id];

    if (!flipReducer) {
      console.error(`Effect not implemented for flip monster: ${name}`);
      return;
    } else if (Array.isArray(flipReducer)) {
      console.error(`Multiple effects found for flip monster: ${name}`);
      return;
    }

    const { effect, text } = flipReducer;
    logEffectMessage(state, zoneCoords, text);
    effect(state, coordsMap);

    // lock/flip/etc.
    postDirectMonsterAction(state, zoneCoords, id);
  },
};

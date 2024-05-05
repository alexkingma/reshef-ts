import { counterAttackReducers } from "../cardEffects/counterAttackEffects";
import { counterSpellReducers } from "../cardEffects/counterSpellEffects";
import { spellEffects } from "../cardEffects/directSpellEffects";
import { flipEffectReducers as flipReducers } from "../cardEffects/flipEffects";
import { BattlePosition, Orientation } from "../enums/duel";
import { FlipEffectMonster } from "../enums/monster_v1.0";
import { DirectSpell } from "../enums/spellTrapRitual_v1.0";
import { getCard } from "../util/cardUtil";
import { clearConvertedZoneFlag, getActiveEffects } from "../util/duellistUtil";
import { checkTriggeredTraps } from "../util/rowUtil";
import {
  attackMonster,
  clearZone,
  destroyAtCoords,
  directAttack,
  getZone,
  postDirectMonsterAction,
  setCardAtCoords,
  specialSummonAtCoords,
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

    specialSummonAtCoords(state, targetCoords!, id, { orientation });
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
    if (checkTriggeredTraps(state, coordsMap, counterAttackReducers)) {
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
    const spellReducer = spellEffects[id as DirectSpell];
    if (!spellReducer) {
      console.log(`Spell effect not implemented for card: ${name}`);
      return;
    }

    // a trap triggering cancels the spell activation attempt
    // and carries out the trap's effect instead
    if (checkTriggeredTraps(state, coordsMap, counterSpellReducers)) {
      return;
    }

    // no traps triggered, activate original spell effect
    console.log(`%c${name}`, "color: #39A24E;");
    spellReducer(state, coordsMap);

    // discard after activation
    clearZone(state, zoneCoords);
  },
  activateMonsterFlipEffect: (state: Duel, coordsMap: ZoneCoordsMap) => {
    const { zoneCoords } = coordsMap;
    const originalZone = getZone(state, zoneCoords) as OccupiedMonsterZone;
    const originalCard = getCard(originalZone.id);
    const flipReducer = flipReducers[originalCard.id as FlipEffectMonster];

    if (!flipReducer) {
      console.log(`Flip effect not implemented for card: ${originalCard.name}`);
      return;
    }

    if (flipReducer) {
      console.log(`%c${originalCard.name}`, "color: #D45420;");
      flipReducer(state, coordsMap);

      // lock/flip/etc.
      postDirectMonsterAction(state, zoneCoords, originalZone.id);
    }
  },
};

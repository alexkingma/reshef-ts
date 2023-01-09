import { BattlePosition, FlipEffectMonster, Spell } from "../common";
import { ZoneCoordsMap } from "../duelSlice";
import {
  attackMonster,
  clearZone,
  destroyAtCoords,
  directAttack,
  generateOccupiedMonsterZone,
  getZone,
  postDirectMonsterAction,
} from "../util/zoneUtil";
import { monsterFlipEffectReducers as flipReducers } from "./monsterFlipEffectReducers";
import { spellEffectReducers as spellReducers } from "./spellEffectReducers";

export const cardReducers = {
  normalSummon: (state: Duel) => {
    const { originCoords, targetCoords } = state.interaction;
    const { card, orientation } = getZone(
      state,
      originCoords!
    ) as OccupiedMonsterZone;
    clearZone(state, originCoords!);
    Object.assign(getZone(state, targetCoords!), {
      ...generateOccupiedMonsterZone(card.name),
      orientation,
    });
    state.activeTurn.hasNormalSummoned = true;
  },
  setSpellTrap: (state: Duel) => {
    const { originCoords, targetCoords } = state.interaction;
    const { card, orientation } = getZone(
      state,
      originCoords!
    ) as OccupiedSpellTrapZone;
    clearZone(state, originCoords!);
    Object.assign(getZone(state, targetCoords!), {
      isOccupied: true,
      card,
      orientation,
    });
  },
  attack: (state: Duel) => {
    const { originCoords, targetCoords } = state.interaction;
    const attackerZone = getZone(state, originCoords!) as OccupiedMonsterZone;
    attackerZone.battlePosition = BattlePosition.Attack;

    if (!targetCoords) {
      // no monsters, attack directly
      directAttack(state, originCoords!);
    } else {
      attackMonster(state, originCoords!, targetCoords);
    }

    attackerZone.isLocked = true;
  },
  defend: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
    const zone = getZone(state, zoneCoords) as OccupiedMonsterZone;
    zone.battlePosition = BattlePosition.Defence;
  },
  tribute: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
    destroyAtCoords(state, zoneCoords);
    state.activeTurn.numTributedMonsters++;
  },
  discard: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
    destroyAtCoords(state, zoneCoords);
  },
  activateSpellEffect: (state: Duel, coordsMap: ZoneCoordsMap) => {
    const { zoneCoords } = coordsMap;
    const { card } = getZone(state, zoneCoords) as OccupiedSpellTrapZone;
    const spellReducer = spellReducers[card.name as Spell];
    if (!spellReducer) {
      console.log(`Spell effect not implemented for card: ${card.name}`);
      return;
    }
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

import { PayloadAction } from "@reduxjs/toolkit";
import { counterAttackEffects } from "../cardEffects/counterAttackEffects";
import { counterSpellEffects } from "../cardEffects/counterSpellEffects";
import { spellEffects } from "../cardEffects/directSpellEffects";
import { flipEffects } from "../cardEffects/flipEffects";
import { BattlePosition, Orientation } from "../enums/duel";
import { getCard } from "../util/cardUtil";
import { getActiveEffects, setOriginTarget } from "../util/duellistUtil";
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

export type OriginTargetPayload = {
  originCoords: ZoneCoords;
  targetCoords: ZoneCoords;
};

export type OriginTargetPayloadAction = PayloadAction<OriginTargetPayload>;
export type OriginPayloadAction = PayloadAction<{ originCoords: ZoneCoords }>;

const attemptAttack = (state: Duel, originCoords: ZoneCoords): boolean => {
  // return true if the attack should go ahead
  const { otherDKey } = state.activeTurn;
  const attackerZone = getZone(state, originCoords) as OccupiedMonsterZone;
  attackerZone.battlePosition = BattlePosition.Attack;
  attackerZone.orientation = Orientation.FaceUp;
  attackerZone.isLocked = true;

  // SoRL is active, no attacks permitted.
  // However, we still want to let the player click attack
  // so as to set their monster in attack position.
  const { sorlTurnsRemaining } = getActiveEffects(state, otherDKey);
  if (sorlTurnsRemaining !== 0) return false;

  // a trap triggering cancels the attack attempt and
  // carries out the trap's effect instead
  if (checkTriggeredTraps(state, counterAttackEffects)) {
    return false;
  }
  return true;
};

const activateSpell = (
  state: Duel,
  originCoords: ZoneCoords,
  targetCoords?: ZoneCoords
) => {
  setOriginTarget(state, { originCoords, targetCoords });
  const { id } = getZone(state, originCoords) as OccupiedSpellTrapZone;
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
  if (checkTriggeredTraps(state, counterSpellEffects)) {
    clearZone(state, originCoords);
    return;
  }

  // no traps triggered, activate original spell effect
  const { effect, text, noDiscard } = spellReducer;
  logEffectMessage(state, originCoords, text);
  effect(state, state.activeTurn);

  if (!noDiscard) {
    // discard after activation
    clearZone(state, originCoords);
  }
};

export const zoneReducers = {
  normalSummon: (state: Duel, { payload }: OriginTargetPayloadAction) => {
    setOriginTarget(state, payload);
    const { originCoords, targetCoords } = payload;
    const { id, orientation } = getZone(state, originCoords) as OccupiedZone;
    clearZone(state, originCoords);
    summonAtCoords(state, targetCoords, id, { orientation });
    state.activeTurn.hasNormalSummoned = true;
  },
  setSpellTrap: (state: Duel, { payload }: OriginTargetPayloadAction) => {
    setOriginTarget(state, payload);
    const { originCoords, targetCoords } = payload;
    const { id, orientation } = getZone(state, originCoords) as OccupiedZone;
    clearZone(state, originCoords);
    setCardAtCoords(state, targetCoords, id, { orientation });
  },
  directAttack: (state: Duel, { payload }: OriginPayloadAction) => {
    setOriginTarget(state, payload);
    const { originCoords } = payload;
    if (!attemptAttack(state, originCoords)) return;
    directAttack(state, originCoords);
  },
  attackMonster: (state: Duel, { payload }: OriginTargetPayloadAction) => {
    setOriginTarget(state, payload);
    const { originCoords, targetCoords } = payload;
    if (!attemptAttack(state, originCoords)) return;
    attackMonster(state, originCoords, targetCoords);
  },
  setDefencePos: (state: Duel, { payload }: OriginPayloadAction) => {
    const z = getZone(state, payload.originCoords) as OccupiedMonsterZone;
    z.battlePosition = BattlePosition.Defence;
    z.isLocked = true;
  },
  setAttackPos: (state: Duel, { payload }: OriginPayloadAction) => {
    const z = getZone(state, payload.originCoords) as OccupiedMonsterZone;
    z.battlePosition = BattlePosition.Attack;
    z.isLocked = true;
  },
  tribute: (state: Duel, { payload }: OriginPayloadAction) => {
    destroyAtCoords(state, payload.originCoords, true);
    state.activeTurn.numTributedMonsters++;
  },
  discard: (state: Duel, { payload }: OriginPayloadAction) => {
    destroyAtCoords(state, payload.originCoords, true);
  },
  activateDirectSpell: (state: Duel, { payload }: OriginPayloadAction) => {
    activateSpell(state, payload.originCoords);
  },
  activateTargetedSpell: (
    state: Duel,
    { payload }: OriginTargetPayloadAction
  ) => {
    const { originCoords, targetCoords } = payload;
    activateSpell(state, originCoords, targetCoords);
  },
  flipMonster: (state: Duel, { payload }: OriginPayloadAction) => {
    setOriginTarget(state, payload);
    const { originCoords } = payload;
    const { id } = getZone(state, originCoords) as OccupiedMonsterZone;
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
    logEffectMessage(state, originCoords, text);
    effect(state, state.activeTurn);

    // lock/flip/etc.
    postDirectMonsterAction(state, originCoords, id);
  },
};

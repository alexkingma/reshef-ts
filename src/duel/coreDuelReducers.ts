import { destroyAtCoords, draw } from "./cardEffectUtil";
import { attackMonster } from "./combatUtil";
import { BattlePosition, FieldRow, Orientation } from "./common";
import {
  clearZone,
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
  getOccupiedMonsterZone,
  getOtherDuellistKey,
  shuffle,
} from "./duelUtil";
import { ReducerArgs } from "./useDuelReducer";

export enum DuelActionType {
  Shuffle = "SHUFFLE",
  DrawCard = "DRAW_CARD",
  NormalSummon = "NORMAL_SUMMON",
  SpecialSummon = "SPECIAL_SUMMON",
  SetSpellTrap = "SET_SPELL_TRAP",
  AttackMonster = "ATTACK_MONSTER",
  ChangeBattlePosition = "CHANGE_BATTLE_POSITION",
  EndTurn = "END_TURN",
  Tribute = "TRIBUTE",
  Discard = "DISCARD",
}

export interface CoreDuelAction {
  duellistKey: DuellistKey;
  type: DuelActionType;
  payload?: any;
}

type DuelReducers = {
  [key in DuelActionType]: (args: ReducerArgs) => void;
};

export interface DuelPartialDispatchActions {
  shuffle: () => void;
  drawCard: () => void;
  normalSummon: (monsterIdx: number) => void;
  setSpellTrap: (handIdx: number) => void;
  attackMonster: (targetIdx: number) => void;
  changeBattlePosition: (monsterIdx: number) => void;
  endTurn: () => void;
  tribute: (monsterIdx: number) => void;
  discard: (coords: FieldCoords) => void;
}

export type DuelDispatchActions = PrependArgInFunctionMap<
  DuelPartialDispatchActions,
  [duellistKey: DuellistKey]
>;

export const coreDuelReducers: DuelReducers = {
  [DuelActionType.Shuffle]: ({ originatorState }) => {
    originatorState.deck = shuffle(originatorState.deck);
  },
  [DuelActionType.DrawCard]: draw(),
  [DuelActionType.NormalSummon]: ({
    originatorState,
    activeTurn,
    payload: handIdx,
  }) => {
    // remove monster from hand at given index, summon it to the field
    const zoneIdx = getFirstEmptyZoneIdx(originatorState.monsterZones, true);
    const { card } = originatorState.hand[handIdx] as OccupiedMonsterZone;
    clearZone(originatorState.hand, handIdx);
    originatorState.monsterZones[zoneIdx] = {
      ...getOccupiedMonsterZone(card),
      orientation: Orientation.FaceDown,
    };
    activeTurn.hasNormalSummoned = true;
  },
  [DuelActionType.SpecialSummon]: ({ originatorState }) => {
    // TODO
  },
  [DuelActionType.SetSpellTrap]: ({ originatorState, payload: handIdx }) => {
    // remove spell/trap from hand at given index, set it on the field
    const zoneIdx = getFirstEmptyZoneIdx(originatorState.spellTrapZones, true);
    const { card } = originatorState.hand[handIdx] as OccupiedSpellTrapZone;
    clearZone(originatorState.hand, handIdx);
    originatorState.spellTrapZones[zoneIdx] = {
      isOccupied: true,
      card,
      orientation: Orientation.FaceDown,
    };
  },
  [DuelActionType.AttackMonster]: ({
    originatorState,
    targetState,
    payload: attackerIdx,
  }) => {
    const attackerZone = originatorState.monsterZones[
      attackerIdx
    ] as OccupiedMonsterZone;
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) {
      // no monsters, attack directly
      targetState.lp -= attackerZone.card.atk;
    } else {
      const targetZone = targetState.monsterZones[
        targetIdx
      ] as OccupiedMonsterZone;
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(attackerZone, targetZone);
      if (attackerDestroyed) {
        destroyAtCoords(originatorState, [FieldRow.PlayerMonster, attackerIdx]);
      }
      if (targetDestroyed) {
        destroyAtCoords(targetState, [FieldRow.OpponentMonster, targetIdx]);
      }
      if (attackerLpLoss) {
        originatorState.lp -= attackerLpLoss;
      }
      if (targetLpLoss) {
        targetState.lp -= targetLpLoss;
      }
    }
    attackerZone.hasAttacked = true;
  },
  [DuelActionType.ChangeBattlePosition]: ({
    originatorState,
    payload: monsterIdx,
  }) => {
    const zone = originatorState.monsterZones[
      monsterIdx
    ] as OccupiedMonsterZone;
    zone.battlePosition =
      zone.battlePosition === BattlePosition.Attack
        ? BattlePosition.Defence
        : BattlePosition.Attack;
  },
  [DuelActionType.EndTurn]: ({ originatorState, activeTurn }) => {
    // reset all turn-based params, then hand over to other player
    originatorState.monsterZones.forEach((zone) => {
      if (!zone.isOccupied) return;
      zone.hasAttacked = false;
    });
    activeTurn.duellistKey = getOtherDuellistKey(activeTurn.duellistKey);
    activeTurn.hasNormalSummoned = false;
    activeTurn.numTributedMonsters = 0;
  },
  [DuelActionType.Tribute]: ({
    originatorState,
    activeTurn,
    payload: monsterIdx,
  }) => {
    destroyAtCoords(originatorState, [FieldRow.PlayerMonster, monsterIdx]);
    activeTurn.numTributedMonsters++;
  },
  [DuelActionType.Discard]: ({ originatorState, payload: coords }) => {
    destroyAtCoords(originatorState, coords);
  },
};

export const getCoreDuelDispatchActions = (
  dispatch: (value: CoreDuelAction) => void
): DuelDispatchActions => ({
  shuffle: (duellistKey: DuellistKey) =>
    dispatch({ duellistKey, type: DuelActionType.Shuffle }),
  drawCard: (duellistKey: DuellistKey) =>
    dispatch({ duellistKey, type: DuelActionType.DrawCard }),
  normalSummon: (duellistKey: DuellistKey, payload: number) =>
    dispatch({
      duellistKey,
      type: DuelActionType.NormalSummon,
      payload,
    }),
  setSpellTrap: (duellistKey: DuellistKey, payload: number) =>
    dispatch({
      duellistKey,
      type: DuelActionType.SetSpellTrap,
      payload,
    }),
  attackMonster: (duellistKey: DuellistKey, payload: number) =>
    dispatch({
      duellistKey,
      type: DuelActionType.AttackMonster,
      payload,
    }),
  changeBattlePosition: (duellistKey: DuellistKey, payload: number) =>
    dispatch({
      duellistKey,
      type: DuelActionType.ChangeBattlePosition,
      payload,
    }),
  endTurn: (duellistKey: DuellistKey) =>
    dispatch({ duellistKey, type: DuelActionType.EndTurn }),
  tribute: (duellistKey: DuellistKey, payload: number) =>
    dispatch({
      duellistKey,
      type: DuelActionType.Tribute,
      payload,
    }),
  discard: (duellistKey: DuellistKey, payload: FieldCoords) =>
    dispatch({
      duellistKey,
      type: DuelActionType.Discard,
      payload,
    }),
});

import { attackMonster } from "./combatUtil";
import { BattlePosition, Orientation } from "./common";
import {
  draw,
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
  getOtherDuellistKey,
  shuffle,
} from "./duelUtil";

export enum DuelActionType {
  AddLP = "ADD_LP",
  SubtractLP = "SUBTRACT_LP",
  Shuffle = "SHUFFLE",
  DrawCard = "DRAW_CARD",
  NormalSummon = "NORMAL_SUMMON",
  SpecialSummon = "SPECIAL_SUMMON",
  SetSpellTrap = "SET_SPELL_TRAP",
  AttackMonster = "ATTACK_MONSTER",
  ChangeBattlePosition = "CHANGE_BATTLE_POSITION",
  EndTurn = "END_TURN",
  Tribute = "TRIBUTE",
}

export interface DuelAction {
  duellistKey: DuellistKey;
  type: DuelActionType;
  payload?: any;
}

type DuelReducers = {
  [key in DuelActionType]: (args: {
    originatorState: DuellistDuelState;
    targetState: DuellistDuelState;
    activeTurn: Turn;
    payload: any;
  }) => void;
};

export interface DuelPartialDispatchActions {
  addLP: (lp: number) => void;
  subtractLP: (lp: number) => void;
  shuffle: () => void;
  drawCard: () => void;
  normalSummon: (monsterIdx: number) => void;
  setSpellTrap: (handIdx: number) => void;
  attackMonster: (targetIdx: number) => void;
  changeBattlePosition: (monsterIdx: number) => void;
  endTurn: () => void;
  tribute: (monsterIdx: number) => void;
}

export type DuelDispatchActions = PrependArgInFunctionMap<
  DuelPartialDispatchActions,
  [duellistKey: DuellistKey]
>;

export const coreDuelReducers: DuelReducers = {
  [DuelActionType.Shuffle]: ({ originatorState }) => {
    originatorState.deck = shuffle(originatorState.deck);
  },
  [DuelActionType.DrawCard]: ({ originatorState }) => {
    let zoneIdx: number;
    try {
      zoneIdx = getFirstEmptyZoneIdx(originatorState.hand, false);
    } catch (e) {
      // no space available in hand, don't draw a card
      return;
    }
    const { card, deck } = draw(originatorState.deck);
    originatorState.deck = deck;
    originatorState.hand[zoneIdx] = {
      isOccupied: true,
      card,
      orientation: Orientation.FaceDown,
    };
  },
  [DuelActionType.AddLP]: ({ originatorState, payload: lpGain }) => {
    originatorState.lp += lpGain;
  },
  [DuelActionType.SubtractLP]: ({ originatorState, payload: lpLoss }) => {
    originatorState.lp = Math.max(originatorState.lp - lpLoss, 0);
  },
  [DuelActionType.NormalSummon]: ({
    originatorState,
    activeTurn,
    payload: handIdx,
  }) => {
    // remove monster from hand at given index, summon it to the field
    const zoneIdx = getFirstEmptyZoneIdx(originatorState.monsterZones);
    const { card } = originatorState.hand[handIdx] as OccupiedMonsterZone;
    originatorState.hand[handIdx] = { isOccupied: false };
    originatorState.monsterZones[zoneIdx] = {
      isOccupied: true,
      card,
      orientation: Orientation.FaceUp,
      battlePosition: BattlePosition.Attack,
      powerUpLevel: 0,
      hasAttacked: false,
    };
    activeTurn.hasNormalSummoned = true;
  },
  [DuelActionType.SpecialSummon]: ({ originatorState }) => {
    // TODO
  },
  [DuelActionType.SetSpellTrap]: ({ originatorState, payload: handIdx }) => {
    // remove spell/trap from hand at given index, set it on the field
    const zoneIdx = getFirstEmptyZoneIdx(originatorState.spellTrapZones);
    const { card } = originatorState.hand[handIdx] as OccupiedSpellTrapZone;
    originatorState.hand[handIdx] = { isOccupied: false };
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
        originatorState.monsterZones[attackerIdx] = { isOccupied: false };
      }
      if (targetDestroyed) {
        targetState.monsterZones[targetIdx] = { isOccupied: false };
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
    originatorState.monsterZones[monsterIdx] = { isOccupied: false };
    activeTurn.numTributedMonsters++;
  },
};

export const getCoreDuelDispatchActions = (
  dispatch: (value: DuelAction) => void
): DuelDispatchActions => ({
  addLP: (duellistKey: DuellistKey, payload: number) =>
    dispatch({ duellistKey, type: DuelActionType.AddLP, payload }),
  subtractLP: (duellistKey: DuellistKey, payload: number) =>
    dispatch({ duellistKey, type: DuelActionType.SubtractLP, payload }),
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
});

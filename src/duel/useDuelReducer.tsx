import { useReducer } from "react";
import produce from "immer";

import {
  draw,
  generateNewDuellistDuelState,
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
  shuffle,
} from "./duelUtil";
import { Orientation, BattlePosition } from "./common";
import { attackMonster } from "./combatUtil";

enum DuelActionType {
  AddLP = "ADD_LP",
  SubtractLP = "SUBTRACT_LP",
  Shuffle = "SHUFFLE",
  DrawCard = "DRAW_CARD",
  NormalSummon = "NORMAL_SUMMON",
  SpecialSummon = "SPECIAL_SUMMON",
  SetSpellTrap = "SET_SPELL_TRAP",
  AttackMonster = "ATTACK_MONSTER",
}

interface DuelAction {
  duellistKey: DuellistKey;
  type: DuelActionType;
  payload?: any;
}

type DuelReducers = {
  [key in DuelActionType]: (
    originator: DuellistDuelState,
    target: DuellistDuelState
  ) => void;
};

export interface DuelPartialDispatchActions {
  addLP: (payload: number) => void;
  subtractLP: (payload: number) => void;
  shuffle: () => void;
  drawCard: () => void;
  normalSummon: (payload: number) => void;
  setSpellTrap: (payload: number) => void;
  attackMonster: (payload: number) => void;
}

export type DuelDispatchActions = PrependArgInFunctionMap<
  DuelPartialDispatchActions,
  [duellistKey: DuellistKey]
>;

const duelReducer = (state: DuelState, action: DuelAction): DuelState =>
  produce(state, (draft) => {
    const duelReducers: DuelReducers = {
      [DuelActionType.Shuffle]: (originatorState: DuellistDuelState) => {
        originatorState.deck = shuffle(originatorState.deck);
      },
      [DuelActionType.DrawCard]: (originatorState: DuellistDuelState) => {
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
      [DuelActionType.AddLP]: (originatorState: DuellistDuelState) => {
        originatorState.lp += action.payload;
      },
      [DuelActionType.SubtractLP]: (originatorState: DuellistDuelState) => {
        originatorState.lp = Math.max(originatorState.lp - action.payload, 0);
      },
      [DuelActionType.NormalSummon]: (originatorState: DuellistDuelState) => {
        // remove monster from hand at given index, summon it to the field
        const handIdx = action.payload;
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
      },
      [DuelActionType.SpecialSummon]: (originatorState: DuellistDuelState) => {
        // TODO
      },
      [DuelActionType.SetSpellTrap]: (originatorState: DuellistDuelState) => {
        // remove spell/trap from hand at given index, set it on the field
        const handIdx = action.payload;
        const zoneIdx = getFirstEmptyZoneIdx(originatorState.spellTrapZones);
        const { card } = originatorState.hand[handIdx] as OccupiedSpellTrapZone;
        originatorState.hand[handIdx] = { isOccupied: false };
        originatorState.spellTrapZones[zoneIdx] = {
          isOccupied: true,
          card,
          orientation: Orientation.FaceDown,
        };
      },
      [DuelActionType.AttackMonster]: (
        originatorState: DuellistDuelState,
        targetState: DuellistDuelState
      ) => {
        const attackerIdx = action.payload;
        const attackerZone = originatorState.monsterZones[
          attackerIdx
        ] as OccupiedMonsterZone;
        const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
        if (targetIdx === -1) {
          // no monsters, attack directly
          targetState.lp -= attackerZone.card.atk;
          return;
        }
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
      },
    };

    const originatorState = draft[action.duellistKey];
    const targetState = draft[action.duellistKey === "p1" ? "p2" : "p1"];
    duelReducers[action.type](originatorState, targetState);
  });

const useDuelReducer = (
  p1CardMap: CardQuantityMap,
  p2CardMap: CardQuantityMap
) => {
  const initialState = {
    p1: generateNewDuellistDuelState(p1CardMap),
    p2: generateNewDuellistDuelState(p2CardMap),
  };
  const [state, dispatch] = useReducer(duelReducer, initialState);

  return {
    state,
    dispatchActions: {
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
    } as DuelDispatchActions,
  };
};

export default useDuelReducer;

import { useReducer } from "react";
import produce, { current } from "immer";

import {
  draw,
  generateNewDuellistDuelState,
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
  shuffle,
} from "./duelUtil";
import { Orientation, BattlePosition } from "./common";
import { attackMonster } from "./combatUtil";

enum DuellistActionType {
  AddLP = "ADD_LP",
  SubtractLP = "SUBTRACT_LP",
  Shuffle = "SHUFFLE",
  DrawCard = "DRAW_CARD",
  NormalSummon = "NORMAL_SUMMON",
  SpecialSummon = "SPECIAL_SUMMON",
  SetSpellTrap = "SET_SPELL_TRAP",
}

interface DuellistAction {
  duellistKey: DuellistKey;
  type: DuellistActionType;
  payload?: any;
}

type DuellistReducers = {
  [key in DuellistActionType]: (state: DuellistDuelState) => void;
};

enum DuelActionType {
  AttackMonster = "ATTACK_MONSTER",
}

interface DuelAction {
  duellistKey: DuellistKey;
  type: DuelActionType;
  payload?: any;
}

type DuelReducers = {
  [key in DuelActionType]: (state: DuelState) => void;
};

export interface DuellistPartialDispatchActions {
  addLP: (payload: number) => void;
  subtractLP: (payload: number) => void;
  shuffle: () => void;
  drawCard: () => void;
  normalSummon: (payload: number) => void;
  setSpellTrap: (payload: number) => void;
}

export type DuellistDispatchActions = PrependArgInFunctionMap<
  DuellistPartialDispatchActions,
  [duellistKey: DuellistKey]
>;

export interface DuelPartialDispatchActions {
  attackMonster: (payload: any) => void;
}

export type DuelDispatchActions = PrependArgInFunctionMap<
  DuelPartialDispatchActions,
  [duellistKey: DuellistKey]
>;

const duelReducer = (
  state: DuelState,
  action: DuelAction | DuellistAction
): DuelState =>
  produce(state, (draft) => {
    const duellistReducers: DuellistReducers = {
      [DuellistActionType.Shuffle]: (duellistState: DuellistDuelState) => {
        duellistState.deck = shuffle(duellistState.deck);
      },
      [DuellistActionType.DrawCard]: (duellistState: DuellistDuelState) => {
        let zoneIdx: number;
        try {
          zoneIdx = getFirstEmptyZoneIdx(duellistState.hand, false);
        } catch (e) {
          // no space available in hand, don't draw a card
          return;
        }
        const { card, deck } = draw(duellistState.deck);
        duellistState.deck = deck;
        duellistState.hand[zoneIdx] = {
          isOccupied: true,
          card,
          orientation: Orientation.FaceDown,
        };
      },
      [DuellistActionType.AddLP]: (duellistState: DuellistDuelState) => {
        duellistState.lp += action.payload;
      },
      [DuellistActionType.SubtractLP]: (duellistState: DuellistDuelState) => {
        duellistState.lp = Math.max(duellistState.lp - action.payload, 0);
      },
      [DuellistActionType.NormalSummon]: (duellistState: DuellistDuelState) => {
        // remove monster from hand at given index, summon it to the field
        // TODO: allow selection of zone to summon at
        const handIdx = action.payload;
        const zoneIdx = getFirstEmptyZoneIdx(duellistState.monsterZones);
        const card = (duellistState.hand[handIdx] as OccupiedMonsterZone).card;
        duellistState.hand[handIdx] = { isOccupied: false };
        duellistState.monsterZones[zoneIdx] = {
          isOccupied: true,
          card,
          orientation: Orientation.FaceUp,
          battlePosition: BattlePosition.Attack,
          powerUpLevel: 0,
          hasAttacked: false,
        };
      },
      [DuellistActionType.SpecialSummon]: (
        duellistState: DuellistDuelState
      ) => {
        // TODO
      },
      [DuellistActionType.SetSpellTrap]: (duellistState: DuellistDuelState) => {
        // remove spell/trap from hand at given index, set it on the field
        // TODO: allow selection of zone to summon at
        const handIdx = action.payload;
        const zoneIdx = getFirstEmptyZoneIdx(duellistState.spellTrapZones);
        const card = (duellistState.hand[handIdx] as OccupiedSpellTrapZone)
          .card;
        duellistState.hand[handIdx] = { isOccupied: false };
        duellistState.spellTrapZones[zoneIdx] = {
          isOccupied: true,
          card,
          orientation: Orientation.FaceDown,
        };
      },
    };
    const duelReducers: DuelReducers = {
      [DuelActionType.AttackMonster]: (duelState: DuelState) => {
        // remove spell/trap from hand at given index, set it on the field
        // TODO: allow selection of zone to summon at
        const { isPlayer, attackerIdx } = action.payload;
        const attackerState = duelState[isPlayer ? "p1" : "p2"];
        const targetState = duelState[isPlayer ? "p2" : "p1"];
        const attackerZone = attackerState.monsterZones[
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
          attackerState.monsterZones[attackerIdx] = { isOccupied: false };
        }
        if (targetDestroyed) {
          targetState.monsterZones[targetIdx] = { isOccupied: false };
        }
        if (attackerLpLoss) {
          attackerState.lp -= attackerLpLoss;
        }
        if (targetLpLoss) {
          targetState.lp -= targetLpLoss;
        }
      },
    };
    if (Object.values(DuelActionType).includes(action.type as DuelActionType)) {
      const { type } = action as DuelAction;
      duelReducers[type](draft);
    } else {
      const { type, duellistKey } = action as DuellistAction;
      duellistReducers[type](draft[duellistKey]);
    }
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
    duellistDispatchActions: {
      addLP: (duellistKey: DuellistKey, payload: number) =>
        dispatch({ duellistKey, type: DuellistActionType.AddLP, payload }),
      subtractLP: (duellistKey: DuellistKey, payload: number) =>
        dispatch({ duellistKey, type: DuellistActionType.SubtractLP, payload }),
      shuffle: (duellistKey: DuellistKey) =>
        dispatch({ duellistKey, type: DuellistActionType.Shuffle }),
      drawCard: (duellistKey: DuellistKey) =>
        dispatch({ duellistKey, type: DuellistActionType.DrawCard }),
      normalSummon: (duellistKey: DuellistKey, payload: number) =>
        dispatch({
          duellistKey,
          type: DuellistActionType.NormalSummon,
          payload,
        }),
      setSpellTrap: (duellistKey: DuellistKey, payload: number) =>
        dispatch({
          duellistKey,
          type: DuellistActionType.SetSpellTrap,
          payload,
        }),
    } as DuellistDispatchActions,
    duelDispatchActions: {
      attackMonster: (duellistKey: DuellistKey, payload: number) =>
        dispatch({
          duellistKey,
          type: DuelActionType.AttackMonster,
          payload: { isPlayer: duellistKey === "p1", attackerIdx: payload },
        }),
    } as DuelDispatchActions,
  };
};

export default useDuelReducer;

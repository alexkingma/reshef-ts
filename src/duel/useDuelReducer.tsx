import { useReducer } from "react";
import produce from "immer";

import {
  draw,
  generateNewDuellistDuelState,
  getFirstEmptyZoneIdx,
  shuffle,
} from "./duelUtil";
import { Orientation, BattlePosition } from "./common";
import { attackMonster } from "./combatUtil";

export type DuellistKey = "p1" | "p2";

interface DuelAction {
  duellistKey: DuellistKey;
  type: DuelActionType;
  payload?: any;
}

type DuelReducers = {
  [key in DuelActionType]: (state: DuellistDuelState) => void;
};

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

const duelReducer = (state: DuelState, action: DuelAction): DuelState =>
  produce(state, (draft) => {
    const duelReducers: DuelReducers = {
      [DuelActionType.Shuffle]: (duellistState: DuellistDuelState) => {
        duellistState.deck = shuffle(duellistState.deck);
      },
      [DuelActionType.DrawCard]: (duellistState: DuellistDuelState) => {
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
      [DuelActionType.AddLP]: (duellistState: DuellistDuelState) => {
        duellistState.lp += action.payload;
      },
      [DuelActionType.SubtractLP]: (duellistState: DuellistDuelState) => {
        duellistState.lp = Math.max(duellistState.lp - action.payload, 0);
      },
      [DuelActionType.NormalSummon]: (duellistState: DuellistDuelState) => {
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
      [DuelActionType.SpecialSummon]: (duellistState: DuellistDuelState) => {
        // TODO
      },
      [DuelActionType.SetSpellTrap]: (duellistState: DuellistDuelState) => {
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
      [DuelActionType.AttackMonster]: (duellistState: DuellistDuelState) => {
        // remove spell/trap from hand at given index, set it on the field
        // TODO: allow selection of zone to summon at
        const attackerIdx = action.payload;
        const attackerZone = duellistState.monsterZones[
          attackerIdx
        ] as OccupiedMonsterZone;
        // const targetIdx = getHighestAtkZoneIdx(duellistState.monsterZones);
        // const targetZone = duellistState.monsterZones[
        //   attackerIdx
        // ] as OccupiedMonsterZone;
        // const { attackerDestroyed, attackerLpLoss } = attackMonster(
        //   attackerZone,
        //   targetZone
        // );
        // if (attackerDestroyed) {
        //   duellistState.monsterZones[attackerIdx] = { isOccupied: false };
        // }
        // if (attackerLpLoss) {
        //   duellistState.lp -= attackerLpLoss;
        // }
      },
    };
    duelReducers[action.type](draft[action.duellistKey]);
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
        dispatch({ duellistKey, type: DuelActionType.NormalSummon, payload }),
      setSpellTrap: (duellistKey: DuellistKey, payload: number) =>
        dispatch({ duellistKey, type: DuelActionType.SetSpellTrap, payload }),
      attackMonster: (duellistKey: DuellistKey, payload: number) =>
        dispatch({ duellistKey, type: DuelActionType.AttackMonster, payload }),
    },
  };
};

export default useDuelReducer;

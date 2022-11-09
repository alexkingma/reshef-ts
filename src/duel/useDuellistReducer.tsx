import { useReducer } from "react";
import produce from "immer";

import {
  draw,
  generateNewDuellistDuelState,
  getFirstEmptyZoneIdx,
  shuffle,
} from "./duelUtil";
import { Orientation, BattlePosition } from "./common";

interface DuellistAction {
  type: DuellistActionType;
  payload?: any;
}

type DuellistReducers = {
  [key in DuellistActionType]: () => void;
};

enum DuellistActionType {
  AddLP = "ADD_LP",
  SubtractLP = "SUBTRACT_LP",
  Shuffle = "SHUFFLE",
  DrawCard = "DRAW_CARD",
  NormalSummon = "NORMAL_SUMMON",
  SpecialSummon = "SPECIAL_SUMMON",
  SetSpellTrap = "SET_SPELL_TRAP",
}

const duellistReducer = (
  state: DuellistDuelState,
  action: DuellistAction
): DuellistDuelState =>
  produce(state, (draft) => {
    const reducers: DuellistReducers = {
      [DuellistActionType.Shuffle]: () => {
        draft.deck = shuffle(draft.deck);
      },
      [DuellistActionType.DrawCard]: () => {
        let zoneIdx: number;
        try {
          zoneIdx = getFirstEmptyZoneIdx(draft.hand, false);
        } catch (e) {
          // no space available in hand, don't draw a card
          return;
        }
        const { card, deck } = draw(draft.deck);
        draft.deck = deck;
        draft.hand[zoneIdx] = {
          isOccupied: true,
          card,
          orientation: Orientation.FaceDown,
        };
      },
      [DuellistActionType.AddLP]: () => {
        draft.lp += action.payload;
      },
      [DuellistActionType.SubtractLP]: () => {
        draft.lp = Math.max(draft.lp - action.payload, 0);
      },
      [DuellistActionType.NormalSummon]: () => {
        // remove monster from hand at given index, summon it to the field
        // TODO: allow selection of zone to summon at
        const handIdx = action.payload;
        const zoneIdx = getFirstEmptyZoneIdx(draft.monsterZones);
        const card = (draft.hand[handIdx] as OccupiedZone).card as MonsterCard;
        draft.hand[handIdx] = { isOccupied: false };
        draft.monsterZones[zoneIdx] = {
          isOccupied: true,
          card,
          orientation: Orientation.FaceUp,
          battlePosition: BattlePosition.Attack,
          powerUpLevel: 0,
          hasAttacked: false,
        };
      },
      [DuellistActionType.SpecialSummon]: () => {
        // TODO
      },
      [DuellistActionType.SetSpellTrap]: () => {
        // remove spell/trap from hand at given index, set it on the field
        // TODO: allow selection of zone to summon at
        const handIdx = action.payload;
        const zoneIdx = getFirstEmptyZoneIdx(draft.spellTrapZones);
        const card = (draft.hand[handIdx] as OccupiedZone)
          .card as SpellOrTrapOrRitualCard;
        draft.hand[handIdx] = { isOccupied: false };
        draft.spellTrapZones[zoneIdx] = {
          isOccupied: true,
          card,
          orientation: Orientation.FaceDown,
        };
      },
    };
    reducers[action.type]();
  });

const useDuelReducer = (cardQuantMap: CardQuantityMap) => {
  const initialState = generateNewDuellistDuelState(cardQuantMap);
  const [state, dispatch] = useReducer(duellistReducer, initialState);

  return {
    state,
    dispatchActions: {
      addLP: (payload: number) =>
        dispatch({ type: DuellistActionType.AddLP, payload }),
      subtractLP: (payload: number) =>
        dispatch({ type: DuellistActionType.SubtractLP, payload }),
      shuffle: () => dispatch({ type: DuellistActionType.Shuffle }),
      drawCard: () => dispatch({ type: DuellistActionType.DrawCard }),
      normalSummon: (payload: number) =>
        dispatch({ type: DuellistActionType.NormalSummon, payload }),
      setSpellTrap: (payload: number) =>
        dispatch({ type: DuellistActionType.SetSpellTrap, payload }),
    },
  };
};

export default useDuelReducer;

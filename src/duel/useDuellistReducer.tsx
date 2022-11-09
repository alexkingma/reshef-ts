import { useReducer } from "react";
import produce from "immer";

import { draw, generateNewDuellistDuelState, shuffle } from "./duelUtil";
import { getRandomCardData } from "../common/deck";
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
  SummonMonster = "SUMMON_MONSTER",
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
        const { card, deck } = draw(draft.deck);
        draft.deck = deck;
        draft.hand.push(card);
      },
      [DuellistActionType.AddLP]: () => {
        draft.lp += action.payload;
      },
      [DuellistActionType.SubtractLP]: () => {
        draft.lp = Math.max(draft.lp - action.payload, 0);
      },
      [DuellistActionType.SummonMonster]: () => {
        // TODO: add payload args for which monster to summon and in which zone
        let nextFreeZoneIdx = draft.monsterZones.findIndex(
          (zone) => !zone.isOccupied
        );
        if (nextFreeZoneIdx === -1) {
          // no free monster zones, just overwrite first slot for now
          nextFreeZoneIdx = 0;
        }
        let card: Card;
        do {
          card = getRandomCardData();
        } while (card.category !== "Monster");
        draft.monsterZones[nextFreeZoneIdx] = {
          isOccupied: true,
          card,
          orientation: Orientation.FaceUp,
          battlePosition: BattlePosition.Attack,
          powerUpLevel: 0,
          hasAttacked: false,
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
      summonMonster: () => dispatch({ type: DuellistActionType.SummonMonster }),
    },
  };
};

export default useDuelReducer;

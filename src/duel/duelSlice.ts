import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import type { RootState } from "../store";
import {
  draw,
  getInitialDuelState,
  getTempCardQuantMap,
  shuffle,
} from "./duelUtil";

const initialState = getInitialDuelState(
  getTempCardQuantMap(),
  getTempCardQuantMap()
);

export const duelSlice = createSlice({
  name: "duel",
  initialState,
  reducers: {
    shuffleDeck: (state) => {
      state.p1.deck = shuffle(state.p1.deck);
    },
    drawCard: (state) => {
      const { card, deck } = draw(state.p1.deck);
      state.p1 = {
        ...state.p1,
        deck,
        hand: [...state.p1.hand, card],
      };
    },
    addLP: (state, action: PayloadAction<number>) => {
      state.p1.lp += action.payload;
    },
  },
});

export const { shuffleDeck, drawCard, addLP } = duelSlice.actions;

export const selectDuelPlayer = (state: RootState) => state.duel.p1;
export const selectDuelOpponent = (state: RootState) => state.duel.p2;

export default duelSlice.reducer;

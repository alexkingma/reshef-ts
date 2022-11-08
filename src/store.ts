import { configureStore } from "@reduxjs/toolkit";

import duelReducer from "./duel/duelSlice";

export const store = configureStore({
  reducer: {
    duel: duelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

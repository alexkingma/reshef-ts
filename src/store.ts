import { combineReducers, configureStore } from "@reduxjs/toolkit";
import duelReducer from "./duel/duelSlice";
import listenerMiddleware from "./duel/onActionTaken";

const rootReducer = combineReducers({
  duel: duelReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["duel/setPendingAction"],
        ignoredPaths: ["duel.interaction.pendingAction"],
      },
    }).prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

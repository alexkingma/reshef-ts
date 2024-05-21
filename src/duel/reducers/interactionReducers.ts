import { PayloadAction } from "@reduxjs/toolkit";
import { InteractionMode } from "../enums/duel";

export const interactionReducers = {
  setCursorZone: (
    { interaction }: Duel,
    { payload }: PayloadAction<ZoneCoords>
  ) => {
    interaction.cursorCoords = payload;
  },
  setPendingCoords: (
    { interaction }: Duel,
    { payload }: PayloadAction<ZoneCoords>
  ) => {
    interaction.pendingCoords = payload;
  },
  setInteractionMode: (
    { interaction }: Duel,
    { payload }: PayloadAction<InteractionMode>
  ) => {
    interaction.mode = payload;
  },
  resetInteractions: ({ interaction, activeTurn }: Duel) => {
    interaction.mode = InteractionMode.FreeMovement;
    interaction.pendingCoords = null;
    activeTurn.originCoords = null;
    activeTurn.targetCoords = null;
  },
};

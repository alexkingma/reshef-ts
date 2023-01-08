import { InteractionMode } from "./common";

export const interactionReducers = {
  setCursorZone: ({ interaction }: Duel, zoneCoords: ZoneCoords) => {
    interaction.cursorCoords = zoneCoords;
  },
  setOriginZone: ({ interaction }: Duel, zoneCoords: ZoneCoords) => {
    interaction.originCoords = zoneCoords;
  },
  setTargetZone: ({ interaction }: Duel, zoneCoords: ZoneCoords) => {
    interaction.targetCoords = zoneCoords;
  },
  setInteractionMode: ({ interaction }: Duel, newMode: InteractionMode) => {
    interaction.mode = newMode;
  },
  setPendingAction: ({ interaction }: Duel, action: () => void) => {
    interaction.pendingAction = action;
  },
  resetInteractions: ({ interaction }: Duel) => {
    interaction.mode = InteractionMode.FreeMovement;
    interaction.pendingAction = null;
    interaction.originCoords = null;
    interaction.targetCoords = null;
  },
};

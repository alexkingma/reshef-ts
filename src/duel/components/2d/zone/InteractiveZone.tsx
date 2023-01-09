import { DuellistKey, InteractionMode } from "@/duel/common";
import { selectInteraction, selectZone } from "@/duel/duelSlice";
import { useInteractionActions } from "@/duel/useInteractionActions";
import { isCoordMatch } from "@/duel/util/duelUtil";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { useIsViableTargetZone } from "./useIsViableTargetZone";
import { Zone } from "./Zone";

interface Props {
  children?: ReactNode;
  zoneCoords: ZoneCoords;
}

export const InteractiveZone = ({ zoneCoords, children }: Props) => {
  const { cursorCoords, originCoords, mode, pendingAction } =
    useAppSelector(selectInteraction);

  const {
    setCursorZone,
    setTargetZone,
    setInteractionMode,
    resetInteractions,
  } = useInteractionActions();
  const isOrigin = !!originCoords && isCoordMatch(zoneCoords, originCoords);
  const isCursor = !!cursorCoords && isCoordMatch(zoneCoords, cursorCoords);
  const isViableTarget = useIsViableTargetZone(zoneCoords);
  const targetIsCard = [
    InteractionMode.ChoosingOpponentMonster,
    InteractionMode.ChoosingOwnMonster,
  ].includes(mode);
  const zone = useAppSelector(selectZone(zoneCoords));
  const hasCard = zone.isOccupied;
  const [dKey] = zoneCoords;
  const isOwn = dKey === DuellistKey.Player;

  const handleMouseEnter = () => {
    if (mode === InteractionMode.Locked) return;
    if (!isCoordMatch(cursorCoords, zoneCoords)) {
      setCursorZone(zoneCoords);
    }
    if (mode === InteractionMode.ViewingOptions) {
      setInteractionMode(InteractionMode.FreeMovement);
    }
  };

  const handleZoneClick = () => {
    if (mode === InteractionMode.FreeMovement && isOwn && hasCard) {
      setInteractionMode(InteractionMode.ViewingOptions);
      return;
    }

    if (isViableTarget) {
      setTargetZone(zoneCoords);
      pendingAction!();
      resetInteractions();
      return;
    }

    if (originCoords && isCoordMatch(zoneCoords, originCoords)) {
      // clicking the origin card cancels out
      // of all coord/mode selections so far
      resetInteractions();
    }
  };

  return (
    <div onClick={handleZoneClick} onMouseEnter={handleMouseEnter}>
      <Zone
        customClasses={classNames(
          "zone",
          isCursor && isOwn && "cursorZone",
          isOrigin && "originZone",
          isViableTarget && !targetIsCard && "viableTargetZone",
          isViableTarget && targetIsCard && "viableTargetCard"
        )}
      >
        {children}
      </Zone>
    </div>
  );
};

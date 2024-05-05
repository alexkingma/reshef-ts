import { selectInteraction, selectZone } from "@/duel/duelSlice";
import { InteractionMode, RowKey } from "@/duel/enums/duel";
import { useInteractionActions } from "@/duel/useDuelActions";
import { InteractionKey, useDuelInteraction } from "@/duel/useDuelInteraction";
import { useZoneButtons } from "@/duel/useZoneButtons";
import { isPlayer } from "@/duel/util/duellistUtil";
import { isCoordMatch } from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { Zone } from "./Zone";
import "./ZoneButtons.scss";
import { useIsViableTargetZone } from "./useIsViableTargetZone";

interface Props {
  children?: ReactNode;
  zoneCoords: ZoneCoords;
}

export const InteractiveZone = ({ zoneCoords, children }: Props) => {
  const { cursorCoords, originCoords, mode, pendingAction } =
    useAppSelector(selectInteraction);
  const buttons = useZoneButtons(zoneCoords);
  const interactionMap = useDuelInteraction(zoneCoords);

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
  const [dKey, rKey] = zoneCoords;
  const isOwn = isPlayer(dKey);

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
      let key: InteractionKey;
      switch (rKey) {
        case RowKey.Monster:
          key = InteractionKey.Attack;
          break;
        case RowKey.SpellTrap:
          key = InteractionKey.ActivateSpell;
          break;
        case RowKey.Hand:
          key =
            zone.card.category === "Monster"
              ? InteractionKey.Summon
              : InteractionKey.SetSpellTrap;
          break;
        default:
          return;
      }
      const { effect, condition } = interactionMap[key];
      if (condition(zone)) effect();
      return;
    }

    if (isViableTarget) {
      setTargetZone(zoneCoords);
      pendingAction!();
      resetInteractions();
      return;
    }

    if (originCoords || mode === InteractionMode.ViewingOptions) {
      // clicking an invalid zone cancels out of coord/mode selections so far
      resetInteractions();
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mode === InteractionMode.FreeMovement && isOwn && hasCard) {
      setInteractionMode(InteractionMode.ViewingOptions);
      return;
    }

    if (originCoords || mode === InteractionMode.ViewingOptions) {
      // player is likely in another menu
      resetInteractions();
    }
  };

  return (
    <div
      onClick={handleZoneClick}
      onMouseEnter={handleMouseEnter}
      onContextMenu={handleRightClick}
    >
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
        {mode === InteractionMode.ViewingOptions && isCursor && (
          <div className="zoneButtonsContainer">{buttons}</div>
        )}
      </Zone>
    </div>
  );
};

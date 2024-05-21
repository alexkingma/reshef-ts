import { actions, selectInteraction, selectZone } from "@/duel/duelSlice";
import { InteractionMode, RowKey } from "@/duel/enums/duel";
import { OriginTargetPayload } from "@/duel/reducers/zoneReducers";
import { InteractionKey, useDuelInteraction } from "@/duel/useDuelInteraction";
import { useZoneButtons } from "@/duel/useZoneButtons";
import { isPlayer } from "@/duel/util/duellistUtil";
import { isCoordMatch, isMonster, isOccupied } from "@/duel/util/zoneUtil";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { Zone } from "./Zone";
import "./ZoneButtons.scss";
import { useIsViableTargetZone } from "./useIsViableTargetZone";

const {
  // interaction
  setCursorZone,
  setInteractionMode,
  resetInteractions,

  // zone
  attackMonster,
  setSpellTrap,
  normalSummon,
  activateTargetedSpell,
} = actions;

interface Props {
  children?: ReactNode;
  zoneCoords: ZoneCoords;
}

export const InteractiveZone = ({ zoneCoords, children }: Props) => {
  const dispatch = useAppDispatch();
  const { cursorCoords, mode, pendingCoords } =
    useAppSelector(selectInteraction);
  const buttons = useZoneButtons(zoneCoords);
  const interactionMap = useDuelInteraction(zoneCoords);

  const isOrigin = !!pendingCoords && isCoordMatch(zoneCoords, pendingCoords);
  const isCursor = !!cursorCoords && isCoordMatch(zoneCoords, cursorCoords);
  const isViableTarget = useIsViableTargetZone(zoneCoords);
  const targetIsCard = [
    InteractionMode.ChoosingOpponentMonster,
    InteractionMode.ChoosingOwnMonster,
  ].includes(mode);
  const z = useAppSelector(selectZone(zoneCoords));
  const hasCard = isOccupied(z);
  const [dKey, rKey] = zoneCoords;
  const isOwn = isPlayer(dKey);

  const handleMouseEnter = () => {
    if (mode === InteractionMode.Locked) return;
    if (!isCoordMatch(cursorCoords, zoneCoords)) {
      dispatch(setCursorZone(zoneCoords));
    }
    if (mode === InteractionMode.ViewingOptions) {
      dispatch(setInteractionMode(InteractionMode.FreeMovement));
    }
  };

  const handleZoneClick = () => {
    if (mode === InteractionMode.FreeMovement && isOwn && hasCard) {
      // default actions to perform for left click
      let key: InteractionKey;
      switch (rKey) {
        case RowKey.Monster:
          key = InteractionKey.Attack;
          break;
        case RowKey.SpellTrap:
          key = InteractionKey.ActivateSpell;
          break;
        case RowKey.Hand:
          key = isMonster(z)
            ? InteractionKey.Summon
            : InteractionKey.SetSpellTrap;
          break;
        default:
          return;
      }
      const { effect, condition } = interactionMap[key];
      if (condition(z)) effect();
      return;
    }

    if (isViableTarget) {
      // user has selected this zone as a target for a prior determined action
      let pendingAction: ActionCreatorWithPayload<OriginTargetPayload>;
      switch (mode) {
        case InteractionMode.ChoosingOwnMonster:
          pendingAction = activateTargetedSpell;
          break;
        case InteractionMode.ChoosingOpponentMonster:
          pendingAction = attackMonster;
          break;
        case InteractionMode.ChoosingOwnSpellTrapZone:
          pendingAction = setSpellTrap;
          break;
        case InteractionMode.ChoosingOwnMonsterZone:
          pendingAction = normalSummon;
          break;
        default:
          console.error(
            `Could not infer pending action for InteractionMode ${mode} at coords: `,
            pendingCoords
          );
          return;
      }
      dispatch(
        pendingAction({
          originCoords: pendingCoords!,
          targetCoords: zoneCoords,
        })
      );
      dispatch(resetInteractions());
      return;
    }

    if (pendingCoords || mode === InteractionMode.ViewingOptions) {
      // clicking an invalid zone cancels out of coord/mode selections so far
      dispatch(resetInteractions());
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mode === InteractionMode.FreeMovement && isOwn && hasCard) {
      dispatch(setInteractionMode(InteractionMode.ViewingOptions));
      return;
    }

    if (pendingCoords || mode === InteractionMode.ViewingOptions) {
      // player is likely in another menu
      dispatch(resetInteractions());
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

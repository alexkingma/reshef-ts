import { DuellistKey, Orientation } from "@/duel/common";
import { selectZone } from "@/duel/duelSlice";
import { isDefMode } from "@/duel/duelUtil";
import { useZoneButtons } from "@/duel/useZoneButtons";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import React from "react";
import "./Card.scss";
import { HiddenCard } from "./HiddenCard";
import { VisibleCard } from "./VisibleCard";

interface Props {
  zoneCoords: ZoneCoords;
}

export const Card = ({ zoneCoords }: Props) => {
  const [dKey] = zoneCoords;
  const z = useAppSelector(selectZone(zoneCoords)) as OccupiedZone;
  const buttons = useZoneButtons(zoneCoords);

  if (!z.isOccupied) return null;

  const isPlayerZone = dKey === DuellistKey.Player;
  const hasVisibleCard = isPlayerZone || z.orientation === Orientation.FaceUp;
  const cardCustomClasses = classNames(isDefMode(z) && "rotatedCard");

  return (
    <div className="cardContainer">
      {hasVisibleCard ? (
        <VisibleCard card={z.card} customClasses={cardCustomClasses} />
      ) : (
        <HiddenCard customClasses={cardCustomClasses} />
      )}
      <div className="zoneButtonsContainer">{buttons}</div>
    </div>
  );
};

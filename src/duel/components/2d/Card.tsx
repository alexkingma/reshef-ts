import { DuellistKey, Orientation, RowKey } from "@/duel/common";
import { selectZone } from "@/duel/duelSlice";
import { isDefMode } from "@/duel/duelUtil";
import { useZoneButtons } from "@/duel/useZoneButtons";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import React from "react";
import "./Card.scss";
import { FaceDownCard } from "./FaceDownCard";
import { FaceUpCard } from "./FaceUpCard";

interface Props {
  zoneCoords: ZoneCoords;
}

export const Card = ({ zoneCoords }: Props) => {
  const [dKey, rKey] = zoneCoords;
  const z = useAppSelector(selectZone(zoneCoords)) as OccupiedZone;
  const buttons = useZoneButtons(zoneCoords);

  if (!z.isOccupied) return null;

  const isPlayerZone = dKey === DuellistKey.Player;
  const isFaceUp = z.orientation === Orientation.FaceUp;
  const alwaysVisible = isFaceUp || (rKey === RowKey.Hand && isPlayerZone);
  const customClasses = classNames(
    isDefMode(z) && "defenceModeCard",
    alwaysVisible && "alwaysVisible",
    isPlayerZone && "showOnHover"
  );

  return (
    <div className="cardContainer">
      <FaceUpCard card={z.card} customClasses={customClasses} />
      <FaceDownCard customClasses={customClasses} />
      <div className="zoneButtonsContainer">{buttons}</div>
    </div>
  );
};

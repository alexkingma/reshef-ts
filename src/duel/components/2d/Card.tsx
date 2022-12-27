import classNames from "classnames";
import React from "react";
import { useAppSelector } from "../../../hooks";
import { DuellistKey, Orientation } from "../../common";
import { selectZone } from "../../duelSlice";
import { isDefMode } from "../../duelUtil";
import "./Card.css";
import { HiddenCard } from "./HiddenCard";
import { VisibleCard } from "./VisibleCard";

interface Props {
  zoneCoords: ZoneCoords;
}

export const Card = ({ zoneCoords }: Props) => {
  const [dKey] = zoneCoords;
  const z = useAppSelector(selectZone(zoneCoords)) as OccupiedZone;

  const isPlayerZone = dKey === DuellistKey.Player;
  const hasVisibleCard = isPlayerZone || z.orientation === Orientation.FaceUp;

  if (!z.isOccupied) return null;

  return (
    <div className={classNames(isDefMode(z) && "rotatedCard")}>
      {hasVisibleCard ? <VisibleCard card={z.card} /> : <HiddenCard />}
    </div>
  );
};

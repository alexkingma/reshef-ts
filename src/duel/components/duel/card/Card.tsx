import { DuellistKey, Orientation, RowKey } from "@/duel/common";
import { selectZone } from "@/duel/duelSlice";
import { isDefMode, isMonster } from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import React from "react";
import "./Card.scss";
import { FaceDownCard } from "./FaceDownCard";
import { FaceUpCard } from "./FaceUpCard";
import { LockedIndicator } from "./LockedIndicator";
import { PowerUpLevelIndicator } from "./PowerUpLevelIndicator";

interface Props {
  zoneCoords: ZoneCoords;
}

export const Card = ({ zoneCoords }: Props) => {
  const [dKey, rKey] = zoneCoords;
  const z = useAppSelector(selectZone(zoneCoords)) as OccupiedZone;

  if (!z.isOccupied) return null;

  const isPlayerZone = dKey === DuellistKey.Player;
  const isFaceUp = z.orientation === Orientation.FaceUp;
  const alwaysVisible = isFaceUp || (rKey === RowKey.Hand && isPlayerZone);
  const customClasses = classNames(
    alwaysVisible && "alwaysVisible",
    isPlayerZone && "showOnHover"
  );

  return (
    <div className={classNames("cardContainer", isDefMode(z) && "defenceMode")}>
      <FaceUpCard card={z.card} customClasses={customClasses} />
      <FaceDownCard customClasses={customClasses} />
      {isMonster(z) && (
        <>
          <LockedIndicator
            zoneCoords={zoneCoords}
            customClasses={customClasses}
          />
          <PowerUpLevelIndicator
            zoneCoords={zoneCoords}
            customClasses={customClasses}
          />
        </>
      )}
    </div>
  );
};

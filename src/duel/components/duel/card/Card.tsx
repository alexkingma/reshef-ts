import { RowKey } from "@/duel/common";
import { selectZone } from "@/duel/duelSlice";
import { isPlayer } from "@/duel/util/duellistUtil";
import { isDefMode, isFaceUp, isMonster } from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
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

  const isPlayerZone = isPlayer(dKey);
  const alwaysVisible = isFaceUp(z) || (rKey === RowKey.Hand && isPlayerZone);
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

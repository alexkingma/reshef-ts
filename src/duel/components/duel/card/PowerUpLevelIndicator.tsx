import { selectZone } from "@/duel/duelSlice";
import { getFinalPowerUpLevel } from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import "./CardIndicator.scss";

interface Props {
  zoneCoords: ZoneCoords;
  customClasses?: string;
}

export const PowerUpLevelIndicator = ({ zoneCoords, customClasses }: Props) => {
  const z = useAppSelector(selectZone(zoneCoords)) as OccupiedMonsterZone;
  const powerUpLevel = getFinalPowerUpLevel(z);

  if (powerUpLevel === 0) return null;

  return (
    <div
      className={classNames("indicatorContainer", "topRight", customClasses)}
    >
      <div
        className={classNames(
          "powerUpLevel",
          powerUpLevel > 0 && "positive",
          powerUpLevel < 0 && "negative"
        )}
      >
        {powerUpLevel}
      </div>
    </div>
  );
};

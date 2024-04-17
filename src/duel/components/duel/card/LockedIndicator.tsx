import { selectZone } from "@/duel/duelSlice";
import { isMonster } from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import "./CardIndicator.scss";

interface Props {
  zoneCoords: ZoneCoords;
  customClasses?: string;
}

export const LockedIndicator = ({ zoneCoords, customClasses }: Props) => {
  const z = useAppSelector(selectZone(zoneCoords));
  if (!isMonster(z) || !z.isLocked) return null;

  return (
    <div
      className={classNames(
        "indicatorContainer",
        "bottomRight",
        customClasses,
        "lockedAlwaysVisible"
      )}
    >
      <div className="isLocked">E</div>
    </div>
  );
};

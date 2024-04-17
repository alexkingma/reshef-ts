import { useAppSelector } from "../hooks";
import { selectZone } from "./duelSlice";
import { useDuelInteraction } from "./useDuelInteraction";

interface Props {
  label: string;
  condition: (z: OccupiedZone) => boolean;
  onClick: (zoneIdx: number) => void;
  zone: OccupiedZone;
  zoneIdx: number;
}

const ZoneButton = ({ zone, zoneIdx, label, condition, onClick }: Props) => {
  if (!condition(zone)) return null;

  return <button onClick={() => onClick(zoneIdx)}>{label}</button>;
};

export const useZoneButtons = (zoneCoords: ZoneCoords) => {
  const [, , colIdx] = zoneCoords;
  const zone = useAppSelector(selectZone(zoneCoords)) as OccupiedZone;
  const duelButtons = useDuelInteraction(zoneCoords);

  return (
    <>
      {Object.entries(duelButtons).map(
        ([buttonKey, { effect, ...buttonProps }]) => {
          return (
            <ZoneButton
              {...buttonProps}
              key={buttonKey}
              onClick={effect}
              zone={zone}
              zoneIdx={colIdx}
            />
          );
        }
      )}
    </>
  );
};

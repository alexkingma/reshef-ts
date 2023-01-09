import { selectZone } from "@/duel/duelSlice";
import { useZoneButtons } from "@/duel/useZoneButtons";
import { isTrap } from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";
import React from "react";

interface Props {
  zoneCoords: ZoneCoords;
}

export const SpellTrapZone = ({ zoneCoords }: Props) => {
  const zone = useAppSelector(selectZone(zoneCoords)) as OccupiedSpellTrapZone;
  const { card } = zone;

  const buttons = useZoneButtons(zoneCoords);

  return (
    <>
      <span style={{ color: isTrap(zone) ? "purple" : "blue" }}>
        {card.name}{" "}
      </span>
      {buttons}
    </>
  );
};

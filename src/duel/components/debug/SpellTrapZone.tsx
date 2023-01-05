import { selectZone } from "@/duel/duelSlice";
import { isTrap } from "@/duel/duelUtil";
import { useZoneButtons } from "@/duel/useZoneButtons";
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

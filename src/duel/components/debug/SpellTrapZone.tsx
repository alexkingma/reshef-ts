import React from "react";
import { useAppSelector } from "../../../hooks";
import { selectZone } from "../../duelSlice";
import { isTrap } from "../../duelUtil";
import { DuelButtonKey, useDuelButtons } from "../../useZoneButtons";

interface Props {
  zoneCoords: ZoneCoords;
}

export const SpellTrapZone = ({ zoneCoords }: Props) => {
  const zone = useAppSelector(selectZone(zoneCoords)) as OccupiedSpellTrapZone;
  const { card } = zone;

  const buttons = useDuelButtons(zoneCoords, [
    DuelButtonKey.SpellEffect,
    DuelButtonKey.Discard,
  ]);

  return (
    <>
      <span style={{ color: isTrap(zone) ? "purple" : "blue" }}>
        {card.name}{" "}
      </span>
      {buttons}
    </>
  );
};

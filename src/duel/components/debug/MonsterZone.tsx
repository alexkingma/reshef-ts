import { BattlePosition } from "@/duel/common";
import { selectZone } from "@/duel/duelSlice";
import { useZoneButtons } from "@/duel/useZoneButtons";
import { useAppSelector } from "@/hooks";
import React from "react";

interface Props {
  zoneCoords: ZoneCoords;
}

export const MonsterZone = ({ zoneCoords }: Props) => {
  const zone = useAppSelector(selectZone(zoneCoords)) as OccupiedMonsterZone;
  const {
    card,
    battlePosition: pos,
    isLocked,
    permPowerUpLevel,
    tempPowerUpLevel,
  } = zone;
  const { effAtk, effDef } = card;

  const buttons = useZoneButtons(zoneCoords);

  return (
    <>
      {pos === BattlePosition.Attack ? "[]" : "=="}{" "}
      <span style={{ color: card.effect ? "darkorange" : "orange" }}>
        {card.name}{" "}
      </span>
      <span style={{ color: "violet" }}>
        {effAtk}/{effDef}{" "}
      </span>
      <span>[P: {permPowerUpLevel}] </span>
      <span>[T: {tempPowerUpLevel}] </span>
      {isLocked ? <span style={{ color: "red" }}>[E]</span> : null}
      {buttons}
    </>
  );
};

import React from "react";
import { BattlePosition, FieldRow } from "../common";
import { DuelButtonKey, useDuelButtons } from "../useZoneButtons";

interface Props {
  duellistKey: DuellistKey;
  zone: OccupiedMonsterZone;
  zoneIdx: FieldCol;
}

export const MonsterZone = ({ duellistKey, zone, zoneIdx }: Props) => {
  const {
    card,
    battlePosition: pos,
    isLocked,
    permPowerUpLevel,
    tempPowerUpLevel,
  } = zone;
  const { effAtk, effDef } = card;
  const zoneCoords: FieldCoords = [FieldRow.PlayerMonster, zoneIdx];

  const buttons = useDuelButtons(duellistKey, zoneCoords, [
    DuelButtonKey.Attack,
    DuelButtonKey.Defend,
    DuelButtonKey.Effect,
    DuelButtonKey.Tribute,
    DuelButtonKey.Discard,
  ]);

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

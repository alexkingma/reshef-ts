import React from "react";
import { useAppSelector } from "../../hooks";
import { FieldRow } from "../common";
import { selectIsMyTurn } from "../duelSlice";
import { isTrap } from "../duelUtil";
import useDuelActions from "../useDuelActions";

interface Props {
  duellistKey: DuellistKey;
  zone: OccupiedSpellTrapZone;
  zoneIdx: FieldCol;
}

export const SpellTrapZone = ({ duellistKey, zone, zoneIdx }: Props) => {
  const { card } = zone;
  const coords: FieldCoords = [FieldRow.PlayerSpellTrap, zoneIdx];
  const isMyTurn = useAppSelector(selectIsMyTurn(duellistKey));
  const { activateSpellEffect, discard } = useDuelActions(duellistKey);

  return (
    <>
      <span style={{ color: isTrap(zone) ? "purple" : "blue" }}>
        {card.name}{" "}
      </span>
      {isMyTurn ? (
        <>
          <button onClick={() => activateSpellEffect(zoneIdx)}>Activate</button>
          <button onClick={() => discard(coords)}>Discard</button>
        </>
      ) : null}
    </>
  );
};

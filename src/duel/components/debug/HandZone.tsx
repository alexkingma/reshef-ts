import { selectZone } from "@/duel/duelSlice";
import { isMonster, isSpell, isTrap } from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";
import React from "react";
import { MonsterZone } from "./MonsterZone";
import { SpellTrapZone } from "./SpellTrapZone";

interface Props {
  zoneCoords: ZoneCoords;
}

export const HandZone = ({ zoneCoords }: Props) => {
  const zone = useAppSelector(selectZone(zoneCoords));

  return (
    <>
      {isMonster(zone) ? <MonsterZone zoneCoords={zoneCoords} /> : null}
      {isSpell(zone) || isTrap(zone) ? (
        <SpellTrapZone zoneCoords={zoneCoords} />
      ) : null}
    </>
  );
};

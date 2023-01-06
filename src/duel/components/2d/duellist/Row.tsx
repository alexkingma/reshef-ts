import { RowKey } from "@/duel/common";
import { selectRow } from "@/duel/duelSlice";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import React from "react";
import { Card } from "../card/Card";
import { Zone } from "../zone/Zone";
import { ZoneBackground } from "../zone/ZoneBackground";
import "./Row.scss";

interface Props {
  rowCoords: RowCoords;
}

export const Row = ({ rowCoords }: Props) => {
  const [, rKey] = rowCoords;
  const isHand = rKey === RowKey.Hand;
  const isMonster = rKey === RowKey.Monster;
  const isSpellTrap = rKey === RowKey.SpellTrap;
  const zones = useAppSelector(selectRow(rowCoords));

  return (
    <div className="row">
      {zones.map((_, i) => (
        <Zone key={i}>
          {!isHand && (
            <ZoneBackground
              customClasses={classNames(
                isMonster && "monsterBackground",
                isSpellTrap && "spellTrapBackground"
              )}
            />
          )}
          <Card zoneCoords={[...rowCoords, i as FieldCol]} />
        </Zone>
      ))}
    </div>
  );
};

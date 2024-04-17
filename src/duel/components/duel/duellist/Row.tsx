import { RowKey } from "@/duel/common";
import { selectRow } from "@/duel/duelSlice";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import { Card } from "../card/Card";
import { InteractiveZone } from "../zone/InteractiveZone";
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
      {zones.map((_, i) => {
        const zoneCoords: ZoneCoords = [...rowCoords, i];
        return (
          <InteractiveZone key={i} zoneCoords={zoneCoords}>
            {!isHand && (
              <ZoneBackground
                customClasses={classNames(
                  isMonster && "monsterBackground",
                  isSpellTrap && "spellTrapBackground"
                )}
              />
            )}
            <Card zoneCoords={zoneCoords} />
          </InteractiveZone>
        );
      })}
    </div>
  );
};

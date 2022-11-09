import React from "react";

import { BattlePosition } from "./common";

interface Props {
  monsterZones: MonsterZone[];
}

export const DuellistMonsterZones = ({ monsterZones }: Props) => {
  return (
    <div>
      Monster Zones:
      <ol>
        {monsterZones.map((zone, idx) => {
          if (!zone.isOccupied) {
            return (
              <li key={idx}>
                <i>Empty</i>
              </li>
            );
          }
          const { card, battlePosition: pos } = zone;
          return (
            <li key={idx}>
              {pos === BattlePosition.Attack ? "[]" : "=="} {card.name} (
              {card.atk}/{card.def})
            </li>
          );
        })}
      </ol>
    </div>
  );
};

import React from "react";

import { BattlePosition } from "./common";
import { DuelPartialDispatchActions } from "./coreDuelReducers";

type Props = Pick<DuellistDuelState, "monsterZones"> &
  Pick<DuelPartialDispatchActions, "attackMonster">;

export const DuellistMonsterZones = ({
  monsterZones,
  attackMonster,
}: Props) => {
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
              <button onClick={() => attackMonster(idx)}>Attack</button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

import React from "react";

import { BattlePosition } from "./common";
import { DuelPartialDispatchActions } from "./coreDuelReducers";

type Props = Pick<DuellistDuelState, "monsterZones"> &
  Pick<DuelPartialDispatchActions, "attackMonster" | "changeBattlePosition">;

export const DuellistMonsterZones = ({
  monsterZones,
  attackMonster,
  changeBattlePosition,
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
              <button onClick={() => changeBattlePosition(idx)}>
                Change Pos
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

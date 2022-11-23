import React from "react";

import { BattlePosition } from "../common";
import { DuelPartialDispatchActions } from "../coreDuelReducers";

type Props = Pick<DuellistDuelState, "monsterZones"> &
  Pick<
    DuelPartialDispatchActions,
    "attackMonster" | "changeBattlePosition" | "tribute"
  > & {
    isMyTurn: boolean;
  };

export const DuellistMonsterZones = ({
  monsterZones,
  isMyTurn,
  attackMonster,
  changeBattlePosition,
  tribute,
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
          const { card, battlePosition: pos, hasAttacked } = zone;
          return (
            <li key={idx}>
              {pos === BattlePosition.Attack ? "[]" : "=="} {card.name} (
              {card.atk}/{card.def})
              {!hasAttacked && isMyTurn ? (
                <button onClick={() => attackMonster(idx)}>Attack</button>
              ) : null}
              <button onClick={() => changeBattlePosition(idx)}>
                Change Pos
              </button>
              <button onClick={() => tribute(idx)}>Tribute</button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

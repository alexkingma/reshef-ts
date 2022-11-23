import React from "react";

import { BattlePosition, FieldRow } from "../common";
import { DuelPartialDispatchActions } from "../coreDuelReducers";

type Props = Pick<DuellistDuelState, "monsterZones"> &
  Pick<
    DuelPartialDispatchActions,
    "attackMonster" | "changeBattlePosition" | "tribute" | "discard"
  > & {
    isMyTurn: boolean;
  };

export const DuellistMonsterZones = ({
  monsterZones,
  isMyTurn,
  attackMonster,
  changeBattlePosition,
  tribute,
  discard,
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
              <button
                onClick={() =>
                  discard([FieldRow.PlayerMonster, idx as FieldCol])
                }
              >
                Discard
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

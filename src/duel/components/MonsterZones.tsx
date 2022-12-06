import React from "react";
import { useAppSelector } from "../../hooks";
import { BattlePosition, FieldRow } from "../common";
import { selectDuellist, selectIsMyTurn } from "../duelSlice";
import useDuelActions from "../useDuelActions";

interface Props {
  duellistKey: DuellistKey;
}

export const DuellistMonsterZones = ({ duellistKey }: Props) => {
  const { monsterZones } = useAppSelector(selectDuellist(duellistKey));
  const isMyTurn = useAppSelector(selectIsMyTurn(duellistKey));
  const { changeBattlePosition, tribute, discard, attackMonster } =
    useDuelActions(duellistKey);

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
          const { card, battlePosition: pos, isLocked } = zone;
          return (
            <li key={idx}>
              {pos === BattlePosition.Attack ? "[]" : "=="} {card.name} (
              {card.atk}/{card.def})
              {!isLocked && isMyTurn ? (
                <button onClick={() => attackMonster(idx as FieldCol)}>
                  Attack
                </button>
              ) : null}
              <button onClick={() => changeBattlePosition(idx as FieldCol)}>
                Change Pos
              </button>
              <button onClick={() => tribute(idx as FieldCol)}>Tribute</button>
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

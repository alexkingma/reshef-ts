import React from "react";
import { FieldRow } from "../common";
import { DuelPartialDispatchActions } from "../coreDuelReducers";

type Props = Pick<DuellistDuelState, "spellTrapZones"> &
  Pick<DuelPartialDispatchActions, "discard"> & {
    isMyTurn: boolean;
  };

export const DuellistSpellTrapZones = ({
  spellTrapZones,
  isMyTurn,
  discard,
}: Props) => {
  return (
    <div>
      Spell/Trap Zones:
      <ol>
        {spellTrapZones.map((zone, idx) => {
          if (!zone.isOccupied) {
            return (
              <li key={idx}>
                <i>Empty</i>
              </li>
            );
          }
          const { card } = zone;
          return (
            <li key={idx}>
              {card.name}
              {isMyTurn ? (
                <button
                  onClick={() =>
                    discard([FieldRow.PlayerSpellTrap, idx as FieldCol])
                  }
                >
                  Discard
                </button>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

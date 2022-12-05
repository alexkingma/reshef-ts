import React from "react";
import { useAppSelector } from "../../hooks";
import { FieldRow } from "../common";
import { selectDuellist, selectIsMyTurn } from "../duelSlice";
import useDuelActions from "../useDuelActions";

interface Props {
  duellistKey: DuellistKey;
}

export const DuellistSpellTrapZones = ({ duellistKey }: Props) => {
  const { spellTrapZones } = useAppSelector(selectDuellist(duellistKey));
  const isMyTurn = useAppSelector(selectIsMyTurn(duellistKey));
  const { activateSpellEffect, discard } = useDuelActions(duellistKey);

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
                <>
                  <button onClick={() => activateSpellEffect(idx as FieldCol)}>
                    Activate
                  </button>
                  <button
                    onClick={() =>
                      discard([FieldRow.PlayerSpellTrap, idx as FieldCol])
                    }
                  >
                    Discard
                  </button>
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

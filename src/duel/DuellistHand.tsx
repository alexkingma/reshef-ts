import React from "react";

import { PartialDispatchActions } from "./useDuelReducer";

type Props = Pick<DuellistDuelState, "hand"> &
  Pick<PartialDispatchActions, "normalSummon" | "setSpellTrap">;

export const DuellistHand = ({ hand, normalSummon, setSpellTrap }: Props) => {
  return (
    <div>
      Hand:
      <ol>
        {hand.map((zone, idx) => (
          <li key={idx}>
            {zone.isOccupied ? (
              <>
                {zone.card.name}{" "}
                {zone.card.category === "Monster" ? (
                  <button onClick={() => normalSummon(idx)}>Summon</button>
                ) : (
                  <button onClick={() => setSpellTrap(idx)}>Set</button>
                )}
              </>
            ) : (
              <i>Empty</i>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

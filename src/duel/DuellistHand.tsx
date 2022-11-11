import React from "react";

import { DuelPartialDispatchActions } from "./coreDuelReducers";

type Props = Pick<DuellistDuelState, "hand"> &
  Pick<DuelPartialDispatchActions, "normalSummon" | "setSpellTrap">;

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
                  <>
                    {"{" + zone.card.alignment + "}"}
                    <button onClick={() => normalSummon(idx)}>Summon</button>
                  </>
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

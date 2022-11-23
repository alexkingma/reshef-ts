import React from "react";

import { DuelPartialDispatchActions } from "../coreDuelReducers";

type Props = Pick<DuellistDuelState, "hand"> &
  Pick<DuelPartialDispatchActions, "normalSummon" | "setSpellTrap"> & {
    canNormalSummon: (card: MonsterCard) => boolean;
  };

export const DuellistHand = ({
  hand,
  canNormalSummon,
  normalSummon,
  setSpellTrap,
}: Props) => {
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
                    {canNormalSummon(zone.card) ? (
                      <button onClick={() => normalSummon(idx)}>Summon</button>
                    ) : null}
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

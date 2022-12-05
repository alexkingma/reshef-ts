import React from "react";
import { FieldRow } from "../common";

import { DuelPartialDispatchActions } from "../coreDuelReducers";

type Props = Pick<Duellist, "hand"> &
  Pick<
    DuelPartialDispatchActions,
    "normalSummon" | "setSpellTrap" | "discard"
  > & {
    isMyTurn: boolean;
    canNormalSummon: (card: MonsterCard) => boolean;
  };

export const DuellistHand = ({
  hand,
  isMyTurn,
  canNormalSummon,
  normalSummon,
  setSpellTrap,
  discard,
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
                {isMyTurn ? (
                  <button
                    onClick={() =>
                      discard([FieldRow.PlayerHand, idx as FieldCol])
                    }
                  >
                    Discard
                  </button>
                ) : null}
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

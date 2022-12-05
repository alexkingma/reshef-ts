import React from "react";
import { useAppSelector } from "../../hooks";
import { FieldRow } from "../common";
import { selectActiveTurn, selectDuellist, selectIsMyTurn } from "../duelSlice";
import { getNumTributesRequired } from "../duelUtil";
import useDuelActions from "../useDuelActions";

interface Props {
  duellistKey: DuellistKey;
}

export const DuellistHand = ({ duellistKey }: Props) => {
  const { hand } = useAppSelector(selectDuellist(duellistKey));
  const isMyTurn = useAppSelector(selectIsMyTurn(duellistKey));
  const { hasNormalSummoned, numTributedMonsters } =
    useAppSelector(selectActiveTurn);
  const { normalSummon, setSpellTrap, discard } = useDuelActions(duellistKey);

  const canNormalSummon = (card: MonsterCard) => {
    if (!isMyTurn || hasNormalSummoned) return false;
    return numTributedMonsters >= getNumTributesRequired(card);
  };

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
                      <button onClick={() => normalSummon(idx as FieldCol)}>
                        Summon
                      </button>
                    ) : null}
                  </>
                ) : (
                  <button onClick={() => setSpellTrap(idx as FieldCol)}>
                    Set
                  </button>
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

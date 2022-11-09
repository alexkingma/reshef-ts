import React from "react";

interface Props {
  hand: DuellistDuelState["hand"];
  normalSummon: (handIdx: number) => void;
  // hasSummonedMonster: boolean;
}

export const DuellistHand = ({ hand, normalSummon }: Props) => {
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
                  ""
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

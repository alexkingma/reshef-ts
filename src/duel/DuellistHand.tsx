import React from "react";

interface Props {
  hand: DuellistDuelState["hand"];
}

export const DuellistHand = ({ hand }: Props) => {
  return (
    <div>
      Hand:
      <ol>
        {hand.map((card, idx) => (
          <li key={idx}>{card.name}</li>
        ))}
      </ol>
    </div>
  );
};

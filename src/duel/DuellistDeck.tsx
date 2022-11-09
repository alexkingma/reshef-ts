import React from "react";

interface Props {
  deck: Deck;
  shuffle: () => void;
  drawCard: () => void;
}

export const DuellistDeck = ({ deck, shuffle, drawCard }: Props) => {
  return (
    <>
      <div>
        Deck:
        <ol>
          {deck.map((card, idx) => (
            <li key={idx}>{card.name}</li>
          ))}
        </ol>
      </div>
      <button onClick={shuffle}>Shuffle</button>
      <button onClick={drawCard}>Draw</button>
    </>
  );
};

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
        Deck:&nbsp;
        <button onClick={shuffle}>Shuffle</button>
        <button onClick={drawCard}>Draw</button>
        <ol>
          {deck.map((card, idx) => (
            <li key={idx}>{card.name}</li>
          ))}
        </ol>
      </div>
    </>
  );
};

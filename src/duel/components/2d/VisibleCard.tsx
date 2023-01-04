import { getImage } from "@/common/image";
import React from "react";

interface Props {
  card: Card;
}

export const VisibleCard = ({ card }: Props) => {
  const cardFront = getImage(card.name);

  return (
    <>
      <img src={cardFront} className="card" />
    </>
  );
};

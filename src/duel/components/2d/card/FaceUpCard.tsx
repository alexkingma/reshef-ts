import { getImage } from "@/common/image";
import classNames from "classnames";
import React from "react";

interface Props {
  card: Card;
  customClasses?: string;
}

export const FaceUpCard = ({ card, customClasses }: Props) => {
  const cardFront = getImage(card.name);

  return (
    <img src={cardFront} className={classNames("faceUpCard", customClasses)} />
  );
};

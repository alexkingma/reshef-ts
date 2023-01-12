import { getCardImage } from "@/common/image";
import classNames from "classnames";
import React from "react";
import { MonsterStats } from "./MonsterStats";

interface Props {
  card: Card;
  customClasses?: string;
}

export const FaceUpCard = ({ card, customClasses }: Props) => {
  const cardFront = getCardImage(card.name);

  return (
    <div className={classNames(customClasses)}>
      <img src={cardFront} className={classNames("faceUpCard")} />
      {card.category === "Monster" && <MonsterStats card={card} />}
    </div>
  );
};

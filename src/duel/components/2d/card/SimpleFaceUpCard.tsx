import { getSimpleImage } from "@/common/image";
import classNames from "classnames";
import React from "react";
import { MonsterStats } from "./MonsterStats";

interface Props {
  card: Card;
  customClasses?: string;
}

export const SimpleFaceUpCard = ({ card, customClasses }: Props) => {
  const cardFront = getSimpleImage(card.name);

  return (
    <div className={classNames(customClasses)}>
      <img
        src={cardFront}
        className={classNames("faceUpCard", customClasses)}
      />
      {card.category === "Monster" && (
        <MonsterStats card={card} customClasses={customClasses} />
      )}
    </div>
  );
};

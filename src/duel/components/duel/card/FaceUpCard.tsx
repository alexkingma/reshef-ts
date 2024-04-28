import { getCardImage } from "@/common/image";
import classNames from "classnames";
import { MonsterStats } from "./MonsterStats";
import { NumTributesIndicator } from "./NumTributesIndicator";

interface Props {
  card: Card;
  customClasses?: string;
}

export const FaceUpCard = ({ card, customClasses }: Props) => {
  const cardFront = getCardImage(card.id);

  return (
    <div className={classNames(customClasses)}>
      <img src={cardFront} className={classNames("faceUpCard")} />
      {card.category === "Monster" && (
        <>
          <MonsterStats card={card} />
          <NumTributesIndicator card={card} />
        </>
      )}
    </div>
  );
};

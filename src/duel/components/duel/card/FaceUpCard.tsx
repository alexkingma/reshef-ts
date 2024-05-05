import { getCardImage } from "@/common/image";
import classNames from "classnames";

interface Props {
  card: Card;
  customClasses?: string;
  children?: React.ReactNode;
}

export const FaceUpCard = ({ card, customClasses, children }: Props) => {
  const cardFront = getCardImage(card.name);

  return (
    <div className={classNames(customClasses)}>
      <img src={cardFront} className={classNames("faceUpCard")} />
      {children}
    </div>
  );
};

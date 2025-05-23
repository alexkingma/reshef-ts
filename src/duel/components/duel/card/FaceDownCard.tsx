import { default as cardBack } from "@/assets/images/card-back.png";
import classNames from "classnames";

interface Props {
  customClasses?: string;
}

export const FaceDownCard = ({ customClasses }: Props) => {
  return (
    <img src={cardBack} className={classNames("faceDownCard", customClasses)} />
  );
};

import classNames from "classnames";
import React from "react";
import { default as cardBack } from "../../../assets/images/card-back.png";

interface Props {
  customClasses?: string;
}

export const HiddenCard = ({ customClasses }: Props) => {
  return (
    <div
      className={classNames(customClasses, "hiddenCard")}
      style={{ backgroundImage: `url(${cardBack})` }}
    />
  );
};

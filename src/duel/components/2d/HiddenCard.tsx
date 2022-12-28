import { default as cardBack } from "@/assets/images/card-back.png";
import classNames from "classnames";
import React from "react";

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

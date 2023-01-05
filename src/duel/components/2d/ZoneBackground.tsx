import { default as transparentCardBack } from "@/assets/images/card-back-20.png";
import classNames from "classnames";
import React from "react";
import "./ZoneBackground.scss";

interface Props {
  customClasses?: string;
}

export const ZoneBackground = ({ customClasses }: Props) => {
  return (
    <div
      className={classNames(customClasses, "zoneBackground")}
      style={{ backgroundImage: `url(${transparentCardBack})` }}
    />
  );
};

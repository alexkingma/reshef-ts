import classNames from "classnames";
import React from "react";
import { default as transparentCardBack } from "../../../assets/images/card-back-20.png";
import "./ZoneBackground.css";

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

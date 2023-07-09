import { getNumTributesRequired } from "@/duel/util/cardUtil";
import classNames from "classnames";
import React from "react";
import "./CardIndicator.scss";

interface Props {
  card: MonsterCard;
}

export const NumTributesIndicator = ({ card }: Props) => {
  const numTributes = getNumTributesRequired(card);

  if (numTributes === 0) return null;

  return (
    <div className={classNames("indicatorContainer", "topLeft")}>
      <div className="numTributes">{numTributes}</div>
    </div>
  );
};

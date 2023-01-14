import classNames from "classnames";
import React from "react";
import "./MonsterStats.scss";

interface Props {
  card: MonsterCard;
}

export const MonsterStats = ({ card }: Props) => {
  return (
    <div className={classNames("statsContainer")}>
      <p className="atk">{card.effAtk}</p>
      <p className="def">{card.effDef}</p>
    </div>
  );
};

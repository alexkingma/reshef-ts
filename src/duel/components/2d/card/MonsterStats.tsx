import classNames from "classnames";
import React from "react";
import "./MonsterStats.scss";

interface Props {
  card: MonsterCard;
  customClasses?: string;
}

export const MonsterStats = ({ card, customClasses }: Props) => {
  return (
    <div className={classNames("statsContainer", customClasses)}>
      <p className="atk">{card.effAtk}</p>
      <p className="def">{card.effDef}</p>
    </div>
  );
};

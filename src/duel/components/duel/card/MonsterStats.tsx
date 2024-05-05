import classNames from "classnames";
import "./MonsterStats.scss";

interface Props {
  atk: number;
  def: number;
}

export const MonsterStats = ({ atk, def }: Props) => {
  return (
    <div className={classNames("statsContainer")}>
      <p className="atk">{atk}</p>
      <p className="def">{def}</p>
    </div>
  );
};

import { DKey, RowKey } from "@/duel/enums/duel";
import { isPlayer } from "@/duel/util/duellistUtil";
import classNames from "classnames";
import { Counterweight } from "../zone/Counterweight";
import { Deck } from "../zone/Deck";
import { Field } from "../zone/Field";
import { Graveyard } from "../zone/Graveyard";
import "./Duellist.scss";
import { DuellistStatus } from "./DuellistStatus";
import { Row } from "./Row";

interface Props {
  dKey: DKey;
}

export const Duellist = ({ dKey }: Props) => {
  const isPlayerSideOfField = isPlayer(dKey);

  return (
    <div className={classNames(!isPlayerSideOfField && "opponent")}>
      <div className="rowContainer">
        <Field duellistKey={dKey} />
        <Row rowCoords={[dKey, RowKey.Monster]} />
        <Graveyard duellistKey={dKey} />
      </div>
      <div className="rowContainer">
        <Counterweight />
        <Row rowCoords={[dKey, RowKey.SpellTrap]} />
        <Deck duellistKey={dKey} />
      </div>
      <div className="rowContainer">
        <DuellistStatus dKey={dKey} />
        <Row rowCoords={[dKey, RowKey.Hand]} />
        <Counterweight />
      </div>
    </div>
  );
};

import { DuellistKey, RowKey } from "@/duel/common";
import {
  selectConfig,
  selectIsComputer,
  selectIsMyTurn,
} from "@/duel/duelSlice";
import { useDuelAI } from "@/duel/useDuelAI";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import React, { useEffect } from "react";
import { Counterweight } from "../zone/Counterweight";
import { Deck } from "../zone/Deck";
import { Field } from "../zone/Field";
import { Graveyard } from "../zone/Graveyard";
import "./Duellist.scss";
import { DuellistStatus } from "./DuellistStatus";
import { Row } from "./Row";

interface Props {
  duellistKey: DuellistKey;
}

export const Duellist = ({ duellistKey }: Props) => {
  const isPlayerSideOfField = duellistKey === DuellistKey.Player;
  const isMyTurn = useAppSelector(selectIsMyTurn(duellistKey));
  const { computerDelayMs } = useAppSelector(selectConfig);
  const isComputer = useAppSelector(selectIsComputer(duellistKey));
  const makeDecision = useDuelAI(duellistKey);

  useEffect(() => {
    let decisionMakingTimeout: NodeJS.Timeout;
    if (isComputer && isMyTurn) {
      decisionMakingTimeout = setTimeout(() => {
        makeDecision();
      }, computerDelayMs);
    }
    return () => clearTimeout(decisionMakingTimeout);
  }, [isComputer, isMyTurn, computerDelayMs, makeDecision]);

  return (
    <div className={classNames(!isPlayerSideOfField && "opponent")}>
      <div className="rowContainer">
        <Field duellistKey={duellistKey} />
        <Row rowCoords={[duellistKey, RowKey.Monster]} />
        <Graveyard duellistKey={duellistKey} />
      </div>
      <div className="rowContainer">
        <Counterweight />
        <Row rowCoords={[duellistKey, RowKey.SpellTrap]} />
        <Deck duellistKey={duellistKey} />
      </div>
      <div className="rowContainer">
        <DuellistStatus duellistKey={duellistKey} />
        <Row rowCoords={[duellistKey, RowKey.Hand]} />
        <Counterweight />
      </div>
    </div>
  );
};

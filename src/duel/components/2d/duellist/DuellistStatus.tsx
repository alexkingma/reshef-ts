import { DuellistKey } from "@/duel/common";
import { selectDuellist, selectIsMyTurn } from "@/duel/duelSlice";
import { useDuellistActions } from "@/duel/useDuellistActions";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import React from "react";
import "./DuellistStatus.scss";

interface Props {
  duellistKey: DuellistKey;
}

export const DuellistStatus = ({ duellistKey }: Props) => {
  const isPlayer = duellistKey === DuellistKey.Player;
  const { endTurn } = useDuellistActions(duellistKey);
  const { name, lp } = useAppSelector(selectDuellist(duellistKey));
  const isMyTurn = useAppSelector(selectIsMyTurn(duellistKey));

  return (
    <div
      className={classNames("statusContainer", !isPlayer && "opponentStatus")}
    >
      <button onClick={endTurn} disabled={!isMyTurn} className="endTurnButton">
        End Turn
      </button>
      <div className="spacer" />
      <div className="name">{name}</div>
      <div className="lp">LP: {lp}</div>
    </div>
  );
};

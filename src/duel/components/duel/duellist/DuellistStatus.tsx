import { actions, selectDuellist, selectIsMyTurn } from "@/duel/duelSlice";
import { DKey } from "@/duel/enums/duel";
import { isPlayer } from "@/duel/util/duellistUtil";
import { useAppDispatch, useAppSelector } from "@/hooks";
import classNames from "classnames";
import { useCallback } from "react";
import "./DuellistStatus.scss";

const { endTurn } = actions;

interface Props {
  dKey: DKey;
}

export const DuellistStatus = ({ dKey }: Props) => {
  const dispatch = useAppDispatch();
  const { name, lp } = useAppSelector(selectDuellist(dKey));
  const isMyTurn = useAppSelector(selectIsMyTurn(dKey));

  const endTurnDispatch = useCallback(() => {
    dispatch(endTurn());
  }, [dispatch]);

  return (
    <div
      className={classNames(
        "statusContainer",
        !isPlayer(dKey) && "opponentStatus"
      )}
    >
      <button
        onClick={endTurnDispatch}
        disabled={!isMyTurn}
        className="endTurnButton"
      >
        End Turn
      </button>
      <div className="spacer" />
      <div className="name">{name}</div>
      <div className="lp">LP: {lp}</div>
    </div>
  );
};

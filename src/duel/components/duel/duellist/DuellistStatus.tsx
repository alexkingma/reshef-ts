import { selectDuellist, selectIsMyTurn } from "@/duel/duelSlice";
import { DuellistKey } from "@/duel/enums/duel";
import { useDuellistActions } from "@/duel/useDuelActions";
import { isPlayer } from "@/duel/util/duellistUtil";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import "./DuellistStatus.scss";

interface Props {
  dKey: DuellistKey;
}

export const DuellistStatus = ({ dKey }: Props) => {
  const { endTurn } = useDuellistActions(dKey);
  const { name, lp } = useAppSelector(selectDuellist(dKey));
  const isMyTurn = useAppSelector(selectIsMyTurn(dKey));

  return (
    <div
      className={classNames(
        "statusContainer",
        !isPlayer(dKey) && "opponentStatus"
      )}
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

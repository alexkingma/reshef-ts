import { DuellistKey } from "@/duel/common";
import { selectActiveTurn } from "@/duel/duelSlice";
import { useDuellistActions } from "@/duel/useDuelActions";
import { useAppSelector } from "@/hooks";
import React, { useEffect } from "react";
import "./Duel.scss";
import { ZoneSummaryBar } from "./ZoneSummaryBar";
import { Duellist } from "./duellist/Duellist";

export const Duel = () => {
  const { duellistKey, isStartOfTurn } = useAppSelector(selectActiveTurn);
  const { startTurn } = useDuellistActions(duellistKey);

  useEffect(() => {
    if (isStartOfTurn) {
      startTurn();
    }
  }, [isStartOfTurn, startTurn]);

  return (
    <div className="duel">
      <Duellist duellistKey={DuellistKey.Opponent} />
      <hr style={{ width: "100px" }} />
      <Duellist duellistKey={DuellistKey.Player} />
      <ZoneSummaryBar />
    </div>
  );
};

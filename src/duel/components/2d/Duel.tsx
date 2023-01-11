import { DuellistKey } from "@/duel/common";
import React from "react";
import "./Duel.scss";
import { Duellist } from "./duellist/Duellist";
import { ZoneSummaryBar } from "./ZoneSummaryBar";

export const Duel = () => {
  return (
    <div className="duel">
      <Duellist duellistKey={DuellistKey.Opponent} />
      <hr style={{ width: "100px" }} />
      <Duellist duellistKey={DuellistKey.Player} />
      <ZoneSummaryBar />
    </div>
  );
};

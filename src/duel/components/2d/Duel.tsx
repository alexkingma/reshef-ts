import { DuellistKey } from "@/duel/common";
import React from "react";
import { Duellist } from "./Duellist";

import "./Duel.css";

export const Duel = () => {
  return (
    <div className="duel">
      <Duellist name="Opponent" duellistKey={DuellistKey.Opponent} />
      <hr style={{ width: "100px" }} />
      <Duellist name="Player" duellistKey={DuellistKey.Player} />
    </div>
  );
};

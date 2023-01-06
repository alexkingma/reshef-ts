import { DuellistKey } from "@/duel/common";
import React from "react";
import { Duellist } from "./Duellist";

import "./Duel.scss";

export const Duel = () => {
  return (
    <div className="duel">
      <Duellist duellistKey={DuellistKey.Opponent} />
      <hr style={{ width: "100px" }} />
      <Duellist duellistKey={DuellistKey.Player} />
    </div>
  );
};

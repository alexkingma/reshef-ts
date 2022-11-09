import React from "react";

import { Duellist } from "./Duellist";
import { getTempCardQuantMap } from "./duelUtil";

export const Duel = () => {
  const playerCardMap = getTempCardQuantMap();
  const opponentCardMap = getTempCardQuantMap();

  return (
    <div style={{ display: "flex" }}>
      <Duellist name="Player" cardQuantMap={playerCardMap} />
      <Duellist name="Opponent" cardQuantMap={opponentCardMap} />
    </div>
  );
};

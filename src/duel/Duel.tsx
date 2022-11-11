import React from "react";

import { Duellist } from "./Duellist";
import { getTempCardQuantMap } from "./duelUtil";
import useDuelReducer, { DuellistKey } from "./useDuelReducer";

export const Duel = () => {
  const playerCardMap = getTempCardQuantMap();
  const opponentCardMap = getTempCardQuantMap();

  const { state, dispatchActions } = useDuelReducer(
    playerCardMap,
    opponentCardMap
  );

  const curryDuellistDispatchActions = (duellistKey: DuellistKey) => {
    const map = {};
    Object.entries(dispatchActions).forEach(([fnName, fn]) => {
      //  @ts-ignore
      map[fnName] = (...args: any[]) => fn(duellistKey, ...args);
      return map;
    });
    return map as typeof dispatchActions;
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        margin: "0 400px",
      }}
    >
      <Duellist
        name="Player"
        {...state.p1}
        {...curryDuellistDispatchActions("p1")}
      />
      <Duellist
        name="Opponent"
        {...state.p2}
        {...curryDuellistDispatchActions("p2")}
      />
    </div>
  );
};

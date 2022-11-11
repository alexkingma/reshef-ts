import React from "react";

import { Duellist } from "./Duellist";
import { getTempCardQuantMap } from "./duelUtil";
import useDuelReducer, { PartialDispatchActions } from "./useDuelReducer";

export const Duel = () => {
  const playerCardMap = getTempCardQuantMap();
  const opponentCardMap = getTempCardQuantMap();

  const { state, dispatchActions } = useDuelReducer(
    playerCardMap,
    opponentCardMap
  );

  const getPartialDuellistDispatchActions = (duellistKey: DuellistKey) => {
    return (
      Object.entries(dispatchActions) as Entries<PartialDispatchActions>
    ).reduce((map, [fnName, fn]) => {
      return {
        ...map,
        // @ts-ignore
        [fnName]: (...args: unknown[]) => fn(duellistKey, ...args),
      };
    }, {} as PartialDispatchActions);
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
        {...getPartialDuellistDispatchActions("p1")}
      />
      <Duellist
        name="Opponent"
        {...state.p2}
        {...getPartialDuellistDispatchActions("p2")}
      />
    </div>
  );
};

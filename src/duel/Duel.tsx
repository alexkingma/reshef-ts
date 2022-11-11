import React from "react";

import { Duellist } from "./Duellist";
import { getTempCardQuantMap } from "./duelUtil";
import useDuelReducer, {
  DuelDispatchActions,
  DuellistDispatchActions,
  DuellistPartialDispatchActions,
  DuelPartialDispatchActions,
} from "./useDuelReducer";

export const Duel = () => {
  const playerCardMap = getTempCardQuantMap();
  const opponentCardMap = getTempCardQuantMap();

  const { state, duellistDispatchActions, duelDispatchActions } =
    useDuelReducer(playerCardMap, opponentCardMap);

  const getPartialDispatchActions = <T, P>(
    dispatchActionMap: T extends P ? any : any,
    duellistKey: DuellistKey
  ) => {
    return (Object.entries(dispatchActionMap) as Entries<P>).reduce(
      (map, [fnName, fn]) => {
        return {
          ...map,
          // @ts-ignore
          [fnName]: (...args: unknown[]) => fn(duellistKey, ...args),
        };
      },
      {} as P
    );
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
        {...getPartialDispatchActions<
          DuellistDispatchActions,
          DuellistPartialDispatchActions
        >(duellistDispatchActions, "p1")}
        {...getPartialDispatchActions<
          DuelDispatchActions,
          DuelPartialDispatchActions
        >(duelDispatchActions, "p1")}
      />
      <Duellist
        name="Opponent"
        {...state.p2}
        {...getPartialDispatchActions<
          DuellistDispatchActions,
          DuellistPartialDispatchActions
        >(duellistDispatchActions, "p2")}
        {...getPartialDispatchActions<
          DuelDispatchActions,
          DuelPartialDispatchActions
        >(duelDispatchActions, "p2")}
      />
    </div>
  );
};

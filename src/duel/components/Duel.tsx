import React from "react";

import { Duellist } from "./Duellist";
import { getTempCardQuantMap } from "../duelUtil";
import useDuelReducer from "../useDuelReducer";
import {
  DuelDispatchActions,
  DuelPartialDispatchActions,
} from "../coreDuelReducers";

export const Duel = () => {
  const playerCardMap = getTempCardQuantMap();
  const opponentCardMap = getTempCardQuantMap();

  const { state, coreDispatches, spellEffectDispatches } = useDuelReducer(
    playerCardMap,
    opponentCardMap
  );

  const getPartialDispatchActions = (duellistKey: DuellistKey) => {
    return (
      Object.entries(coreDispatches) as Entries<DuelDispatchActions>
    ).reduce((map, [fnName, fn]) => {
      return {
        ...map,
        // @ts-ignore
        [fnName]: (...args: unknown[]) => fn(duellistKey, ...args),
      };
    }, {} as DuelPartialDispatchActions);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        margin: "0 400px",
      }}
    >
      <div>
        <h5>General Duel Info</h5>
        <p>Field: {state.activeField}</p>
        <p>Num Tributes: {state.activeTurn.numTributedMonsters}</p>
        <p>
          Has Normal Summoned:{" "}
          {state.activeTurn.hasNormalSummoned ? "YES" : "NO"}
        </p>
      </div>
      <Duellist
        name="Player"
        duellistKey="p1"
        activeTurn={state.activeTurn}
        spellEffectDispatches={spellEffectDispatches}
        {...state.p1}
        {...getPartialDispatchActions("p1")}
      />
      <Duellist
        name="Opponent"
        duellistKey="p2"
        activeTurn={state.activeTurn}
        spellEffectDispatches={spellEffectDispatches}
        {...state.p2}
        {...getPartialDispatchActions("p2")}
      />
    </div>
  );
};

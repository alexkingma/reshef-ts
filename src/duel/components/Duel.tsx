import React from "react";

import { Duellist } from "./Duellist";
import { useAppSelector } from "../../hooks";
import { selectActiveTurn, selectDuel } from "../duelSlice";

export const Duel = () => {
  const { numTributedMonsters, hasNormalSummoned } =
    useAppSelector(selectActiveTurn);
  const { activeField } = useAppSelector(selectDuel);

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
        <p>Field: {activeField}</p>
        <p>Num Tributes: {numTributedMonsters}</p>
        <p>Has Normal Summoned: {hasNormalSummoned ? "YES" : "NO"}</p>
      </div>
      <Duellist name="Player" duellistKey="p1" />
      <Duellist name="Opponent" duellistKey="p2" />
    </div>
  );
};

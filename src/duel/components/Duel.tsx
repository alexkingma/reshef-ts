import React from "react";
import { Duellist } from "./Duellist";
import { useAppSelector } from "../../hooks";
import { selectActiveTurn, selectDuel } from "../duelSlice";
import { DuellistKey } from "../common";

export const Duel = () => {
  const { numTributedMonsters, hasNormalSummoned, isStartOfTurn } =
    useAppSelector(selectActiveTurn);
  const { activeField } = useAppSelector(selectDuel);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        margin: "0 100px",
      }}
    >
      <div>
        <h5>General Duel Info</h5>
        <p>Field: {activeField}</p>
        <p>Num Tributes: {numTributedMonsters}</p>
        <p>Turn start: {isStartOfTurn ? "YES" : "NO"}</p>
        <p>Has Normal Summoned: {hasNormalSummoned ? "YES" : "NO"}</p>
      </div>
      <Duellist name="Player" duellistKey={DuellistKey.Player} />
      <Duellist name="Opponent" duellistKey={DuellistKey.Opponent} />
    </div>
  );
};

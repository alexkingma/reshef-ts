import { DuellistKey } from "@/duel/common";
import { selectActiveTurn, selectInteraction } from "@/duel/duelSlice";
import { useAppSelector } from "@/hooks";
import React from "react";
import { Duellist } from "./Duellist";

export const Duel = () => {
  const { numTributedMonsters, hasNormalSummoned, isStartOfTurn } =
    useAppSelector(selectActiveTurn);
  const { cursorCoords, mode, originCoords, targetCoords, pendingAction } =
    useAppSelector(selectInteraction);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        margin: "0 10px",
        color: "white",
      }}
    >
      <div>
        <h5>General Duel Info</h5>
        <p>Num Tributes: {numTributedMonsters}</p>
        <p>Turn start: {isStartOfTurn ? "YES" : "NO"}</p>
        <p>Has Normal Summoned: {hasNormalSummoned ? "YES" : "NO"}</p>
        <div>Cursor Coords: {`[${cursorCoords.toString()}]`}</div>
        <div>
          Origin Coords:{" "}
          {originCoords ? `[${originCoords.toString()}]` : <i>N/A</i>}
        </div>
        <div>
          Target Coords:{" "}
          {targetCoords ? `[${targetCoords.toString()}]` : <i>N/A</i>}
        </div>
        <div>Interaction Mode: {mode}</div>
        <div>Has Pending Action: {pendingAction ? "YES" : "NO"}</div>
      </div>
      <Duellist name="Player" duellistKey={DuellistKey.Player} />
      <Duellist name="Opponent" duellistKey={DuellistKey.Opponent} />
    </div>
  );
};

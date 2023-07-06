import { useAppSelector } from "@/hooks";
import React, { useEffect, useState } from "react";
import { selectActiveTurn } from "../duelSlice";
import { useDuellistActions } from "../useDuelActions";
import { Duel as Duel2D } from "./2d/Duel";
import { Duel as DuelDebug } from "./debug/Duel";

export const Duel = () => {
  const { duellistKey, isStartOfTurn } = useAppSelector(selectActiveTurn);
  const { startTurn, randomiseDuel } = useDuellistActions(duellistKey);

  useEffect(() => {
    if (isStartOfTurn) {
      startTurn();
    }
  }, [isStartOfTurn, startTurn]);

  const [renderMode, setRenderMode] = useState("visual");

  return (
    <>
      <div style={{ position: "absolute", zIndex: 1 }}>
        {renderMode === "visual" ? (
          <button onClick={() => setRenderMode("text")}>
            Go To Debug Mode
          </button>
        ) : null}
        {renderMode === "text" ? (
          <button onClick={() => setRenderMode("visual")}>
            Go To Game Mode
          </button>
        ) : null}
        <br />
        <button onClick={() => randomiseDuel()}>Randomise Duel</button>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {renderMode === "text" ? <DuelDebug /> : <Duel2D />}
      </div>
    </>
  );
};

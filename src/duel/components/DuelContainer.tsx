import { useAppSelector } from "@/hooks";
import React, { useCallback, useEffect, useState } from "react";
import { selectConfig, selectIsDuelOver } from "../duelSlice";
import { useDuelActions } from "../useDuelActions";
import { getTempCardQuantMap } from "../util/deckUtil";
import { getNewDuel } from "../util/duelUtil";
import { Duel as Duel2D } from "./2d/Duel";
import { DuelConfig } from "./config/DuelConfig";

export enum GameMode {
  Idle = "IDLE",
  Duel = "DUEL",
}

export const DuelContainer = () => {
  const [mode, setMode] = useState(GameMode.Idle);
  const { remainingDuels } = useAppSelector(selectConfig);
  const isDuelOver = useAppSelector(selectIsDuelOver);
  const { setDuel, decrementRemainingDuels } = useDuelActions();
  const [p1Deck, setP1Deck] = useState(getTempCardQuantMap());
  const [p2Deck, setP2Deck] = useState(getTempCardQuantMap());

  const startNewDuel = useCallback(() => {
    setP1Deck(getTempCardQuantMap());
    setP2Deck(getTempCardQuantMap());
    setDuel(getNewDuel(p1Deck, p2Deck));
    setMode(GameMode.Duel);
  }, [p1Deck, p2Deck, setDuel]);

  useEffect(() => {
    if (mode !== GameMode.Duel) return;

    if (isDuelOver) {
      console.log(`%cDuel has ended!`, "color:#d4af37");
      if (remainingDuels) {
        // at least one more duel is needed, start it now
        decrementRemainingDuels();
        startNewDuel();
      } else {
        // all duels/simulations complete, quit duel view
        setMode(GameMode.Idle);
      }
    }
  }, [mode, isDuelOver, remainingDuels, startNewDuel, decrementRemainingDuels]);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {mode === GameMode.Idle ? (
          <>
            <DuelConfig />
            <button onClick={startNewDuel}>Start Duel</button>
          </>
        ) : (
          <Duel2D />
        )}
      </div>
    </>
  );
};

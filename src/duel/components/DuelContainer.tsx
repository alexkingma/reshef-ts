import { useAppSelector } from "@/hooks";
import React, { useCallback, useEffect, useState } from "react";
import {
  selectConfig,
  selectIsDuelOver,
  selectIsSimulation,
} from "../duelSlice";
import { useDuelAI } from "../useDuelAI";
import { useDuelActions } from "../useDuelActions";
import { useElo } from "../useElo";
import { getTempCardQuantMap } from "../util/deckUtil";
import { getNewDuel } from "../util/duelUtil";
import { DuelConfig } from "./config/DuelConfig";
import { Duel } from "./duel/Duel";

export enum GameMode {
  Idle = "IDLE",
  Duel = "DUEL",
}

export const DuelContainer = () => {
  const [mode, setMode] = useState(GameMode.Idle);
  const isSimulation = useAppSelector(selectIsSimulation);
  const { totalDuelsToPlay, showDuelUI } = useAppSelector(selectConfig);
  const isDuelOver = useAppSelector(selectIsDuelOver);
  const { setDuel, updateConfig } = useDuelActions();
  const [numDuelsFinished, setNumDuelsFinished] = useState(0);
  const [p1Deck, setP1Deck] = useState(getTempCardQuantMap());
  const [p2Deck, setP2Deck] = useState(getTempCardQuantMap());
  const { updateEloMap } = useElo();
  useDuelAI();

  const startNewDuel = useCallback(() => {
    setP1Deck(getTempCardQuantMap());
    setP2Deck(getTempCardQuantMap());
    setDuel(getNewDuel(p1Deck, p2Deck));
  }, [p1Deck, p2Deck, setDuel]);

  const onStartClicked = useCallback(() => {
    setNumDuelsFinished(0);
    startNewDuel();
    setMode(GameMode.Duel);
  }, [startNewDuel]);

  useEffect(() => {
    if (!isDuelOver || mode !== GameMode.Duel) return;

    console.log(`%cDuel has ended!`, "color:#d4af37");
    setNumDuelsFinished((val) => val + 1);

    if (isSimulation) {
      // two computers are playing, so we can use the result of this duel
      // to update the Elo records of each card/deck
      updateEloMap();
    }

    const remainingDuels = totalDuelsToPlay - numDuelsFinished;
    if (remainingDuels > 0) {
      // at least one more duel is needed, start it now
      console.log(`${remainingDuels} duels remaining.`);
      startNewDuel();
    } else {
      // all duels/simulations complete, quit duel view
      setMode(GameMode.Idle);
    }
  }, [
    mode,
    isDuelOver,
    isSimulation,
    totalDuelsToPlay,
    numDuelsFinished,
    startNewDuel,
    updateConfig,
    updateEloMap,
  ]);

  return (
    <div>
      {mode === GameMode.Duel && (
        <div style={{ position: "absolute" }}>
          <>
            {numDuelsFinished}/{totalDuelsToPlay} (
            {Math.round((numDuelsFinished / totalDuelsToPlay) * 100)}%)
          </>
          <br />
          <br />
          {
            <button onClick={() => updateConfig({ showDuelUI: !showDuelUI })}>
              {showDuelUI ? "Hide" : "Show"} Duels
            </button>
          }
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {mode === GameMode.Idle || !showDuelUI ? (
          <>
            <DuelConfig />
            <button onClick={onStartClicked}>Start Duel</button>
          </>
        ) : (
          <Duel />
        )}
      </div>
    </div>
  );
};

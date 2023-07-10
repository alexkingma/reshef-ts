import { useAppSelector } from "@/hooks";
import React, { useCallback, useEffect, useState } from "react";
import {
  selectActiveTurn,
  selectConfig,
  selectIsDuelOver,
  selectIsSimulation,
} from "../duelSlice";
import { useDuelAI } from "../useDuelAI";
import { useDuelActions } from "../useDuelActions";
import { useElo } from "../useElo";
import { getNewDuel } from "../util/duelUtil";
import { getRandomDuellable } from "../util/duellistUtil";
import "./DuelContainer.scss";
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
  const { isStartOfTurn } = useAppSelector(selectActiveTurn);
  const isDuelOver = useAppSelector(selectIsDuelOver);
  const { setDuel, updateConfig, startTurn } = useDuelActions();
  const [numDuelsFinished, setNumDuelsFinished] = useState(0);
  const { updateEloMap } = useElo();
  useDuelAI();

  const startNewDuel = useCallback(() => {
    const d1 = getRandomDuellable().name;
    let d2: DuellableName;
    do {
      // don't let a duellist play themselves, rating will never change
      d2 = getRandomDuellable().name;
    } while (d2 === d1);
    setDuel(getNewDuel(d1, d2));
  }, [setDuel]);

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
      // two CPUs are playing, so we can use the result of this duel
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
    updateEloMap,
  ]);

  useEffect(() => {
    if (isStartOfTurn) {
      startTurn();
    }
  }, [isStartOfTurn, startTurn]);

  return (
    <div className="duelContainer">
      {mode === GameMode.Duel && (
        <div className="overlay">
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

      <div className="configContainer">
        {mode === GameMode.Idle || !showDuelUI ? (
          <div className="config">
            <DuelConfig />
            <br />
            <button onClick={onStartClicked}>Start Duel</button>
          </div>
        ) : (
          <Duel />
        )}
      </div>
    </div>
  );
};

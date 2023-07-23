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
  const { p1Name, p2Name } = useAppSelector(selectConfig);
  const { setDuel, updateConfig, startTurn } = useDuelActions();
  const [numDuelsFinished, setNumDuelsFinished] = useState(0);
  const { updateEloMap } = useElo();
  useDuelAI();

  const randomiseDuellists = useCallback(() => {
    const d1 = getRandomDuellable().name;
    let d2: DuellableName;
    do {
      // don't let a duellist play themselves, rating will never change
      d2 = getRandomDuellable().name;
    } while (d2 === d1);
    updateConfig({ p1Name: d1, p2Name: d2 });
    setDuel(getNewDuel(d1, d2));
  }, [updateConfig, setDuel]);

  const onStartClicked = useCallback(() => {
    // scrap the background duel, start a new duel with the duellists from config
    setNumDuelsFinished(0);
    setDuel(getNewDuel(p1Name, p2Name));
    setMode(GameMode.Duel);
  }, [setDuel, p1Name, p2Name]);

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
      randomiseDuellists();
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
    randomiseDuellists,
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
        {mode === GameMode.Idle && (
          <div className="config">
            <DuelConfig />
            <br />
            <button onClick={onStartClicked}>Start Duel</button>
          </div>
        )}
        {mode === GameMode.Duel && showDuelUI && <Duel />}
      </div>
    </div>
  );
};

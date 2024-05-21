import { useAppDispatch, useAppSelector } from "@/hooks";
import { useCallback, useEffect, useState } from "react";
import { actions, selectConfig, selectIsDuelOver } from "../duelSlice";
import { DuelType } from "../enums/duel";
import { useDuelAI } from "../useDuelAI";
import { useDuelStats } from "../useDuelStats";
import { useElo } from "../useElo";
import "./DuelContainer.scss";
import { SimulationOverlay } from "./SimulationOverlay";
import { DuelConfig } from "./config/DuelConfig";
import { Duel } from "./duel/Duel";

const { initDuel, randomiseDuellists } = actions;

enum Page {
  Config,
  Simulation,
  Exhibition,
}

export const DuelContainer = () => {
  const dispatch = useAppDispatch();
  const { totalDuelsToPlay, showDuelUI, duelType } =
    useAppSelector(selectConfig);
  const isDuelOver = useAppSelector(selectIsDuelOver);

  const [activePage, setActivePage] = useState(Page.Config);
  const [numDuelsFinished, setNumDuelsFinished] = useState(0);
  const [numActionsTaken, setNumActionsTaken] = useState(0);

  const { updateStatsMap } = useDuelStats();
  const { updateEloMap } = useElo();

  const onAiAction = useCallback(() => {
    setNumActionsTaken((n) => n + 1);
  }, []);

  useDuelAI(onAiAction);

  const onStartClicked = useCallback(() => {
    setNumDuelsFinished(0);
    dispatch(initDuel());
    setActivePage(
      duelType === DuelType.Simulation ? Page.Simulation : Page.Exhibition
    );
  }, [duelType, dispatch]);

  useEffect(() => {
    if (!isDuelOver || activePage === Page.Config) return;

    console.log(`%cDuel has ended!`, "color:#d4af37");
    setNumDuelsFinished((val) => val + 1);

    if (duelType === DuelType.Simulation) {
      // two CPUs are playing, so we can use the result of this duel
      // to update the Elo records of each card/deck
      updateEloMap();
      updateStatsMap();
    }

    const remainingDuels = totalDuelsToPlay - numDuelsFinished;
    if (remainingDuels > 0) {
      // at least one more duel is needed, start it now
      console.log(`${remainingDuels} duels remaining.`);
      dispatch(randomiseDuellists());
    } else {
      // all duels/simulations complete, quit duel view
      setActivePage(Page.Config);
    }
  }, [
    activePage,
    isDuelOver,
    duelType,
    totalDuelsToPlay,
    numDuelsFinished,
    dispatch,
    updateEloMap,
    updateStatsMap,
  ]);

  return (
    <div className="duelContainer">
      {activePage === Page.Simulation && (
        <SimulationOverlay
          numDuelsFinished={numDuelsFinished}
          numActionsTaken={numActionsTaken}
        />
      )}

      <div className="configContainer">
        {activePage === Page.Config && (
          <DuelConfig onDuelStart={onStartClicked} />
        )}
      </div>

      {activePage !== Page.Config && showDuelUI && <Duel />}
    </div>
  );
};

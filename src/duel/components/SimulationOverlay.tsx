import { useAppDispatch, useAppSelector } from "@/hooks";
import { useCallback, useEffect, useState } from "react";
import { actions, selectConfig } from "../duelSlice";
import "./DuelContainer.scss";

const { updateConfig } = actions;

const MS_INTERVAL = 200;
const MS_PER_SEC = 1000;

interface Props {
  numDuelsFinished: number;
  numActionsTaken: number;
}

export const SimulationOverlay = ({
  numActionsTaken,
  numDuelsFinished,
}: Props) => {
  const dispatch = useAppDispatch();
  const { totalDuelsToPlay, showDuelUI } = useAppSelector(selectConfig);
  const [msElapsed, setMsElapsed] = useState(0);

  const percComplete = Math.round((numDuelsFinished / totalDuelsToPlay) * 100);
  const actionsPerSec = Math.round((numActionsTaken / msElapsed) * MS_PER_SEC);
  const duelsPerSec =
    Math.round((numDuelsFinished / msElapsed) * MS_PER_SEC * 10) / 10;

  const toggleUI = useCallback(() => {
    dispatch(updateConfig({ showDuelUI: !showDuelUI }));
  }, [dispatch, showDuelUI]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMsElapsed((t) => t + MS_INTERVAL);
    }, MS_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="overlay">
      <>
        {numDuelsFinished}/{totalDuelsToPlay} ({percComplete}%)
      </>
      <br />
      <>Time Elapsed: {Math.round(msElapsed / MS_PER_SEC)}s</>
      <br />
      <>Actions/sec: {msElapsed > 0 && actionsPerSec}</>
      <br />
      <>Duels/sec: {msElapsed > 0 && duelsPerSec}</>
      <br />
      <br />
      {<button onClick={toggleUI}>{showDuelUI ? "Hide" : "Show"} Duels</button>}
    </div>
  );
};

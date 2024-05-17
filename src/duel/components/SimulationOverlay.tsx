import { useAppSelector } from "@/hooks";
import { useEffect, useState } from "react";
import { selectConfig } from "../duelSlice";
import { useDuelActions } from "../useDuelActions";
import "./DuelContainer.scss";

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
  const { totalDuelsToPlay, showDuelUI } = useAppSelector(selectConfig);
  const { updateConfig } = useDuelActions();
  const [msElapsed, setMsElapsed] = useState(0);

  const percComplete = Math.round((numDuelsFinished / totalDuelsToPlay) * 100);
  const actionsPerSec = Math.round((numActionsTaken / msElapsed) * MS_PER_SEC);
  const duelsPerSec = Math.round((numDuelsFinished / msElapsed) * MS_PER_SEC);

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
      {
        <button onClick={() => updateConfig({ showDuelUI: !showDuelUI })}>
          {showDuelUI ? "Hide" : "Show"} Duels
        </button>
      }
    </div>
  );
};

import { DuellistKey } from "@/duel/common";
import "./Duel.scss";
import { ZoneSummaryBar } from "./ZoneSummaryBar";
import { Duellist } from "./duellist/Duellist";

export const Duel = () => {
  return (
    <div className="duel">
      <Duellist dKey={DuellistKey.Opponent} />
      <hr style={{ width: "100px" }} />
      <Duellist dKey={DuellistKey.Player} />
      <ZoneSummaryBar />
    </div>
  );
};

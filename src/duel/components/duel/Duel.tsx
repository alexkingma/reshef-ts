import { DKey } from "@/duel/enums/duel";
import "./Duel.scss";
import { ZoneSummaryBar } from "./ZoneSummaryBar";
import { Duellist } from "./duellist/Duellist";

export const Duel = () => {
  return (
    <div className="duel">
      <Duellist dKey={DKey.Opponent} />
      <hr style={{ width: "100px" }} />
      <Duellist dKey={DKey.Player} />
      <ZoneSummaryBar />
    </div>
  );
};

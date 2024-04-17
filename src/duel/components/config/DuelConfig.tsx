import { PlayerType } from "@/duel/common";
import { selectConfig } from "@/duel/duelSlice";
import { useDuelActions } from "@/duel/useDuelActions";
import { getDuellables } from "@/duel/util/duellistUtil";
import { useAppSelector } from "@/hooks";
import { ChangeEvent } from "react";
import { NumberField } from "./NumberField";
import { SelectField } from "./SelectField";

const PLAYER_TYPE_OPTIONS = [
  { label: "Human", value: PlayerType.Human },
  { label: "CPU", value: PlayerType.CPU },
];

const DUELLABLE_OPTIONS = getDuellables().map((d) => ({
  label: d.name,
  value: d.name,
}));

export const DuelConfig = () => {
  const {
    cpuDelayMs,
    p1Name,
    p1Type,
    p2Name,
    p2Type,
    totalDuelsToPlay,
    showDuelUI,
  } = useAppSelector(selectConfig);
  const { updateConfig } = useDuelActions();

  const onCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked as boolean;
    const key = e.target.name as keyof DuelConfig;
    updateConfig({ [key]: val });
  };

  return (
    <div style={{ color: "white" }}>
      <h2 style={{ display: "flex", justifyContent: "center" }}>Config</h2>

      <NumberField
        title="Delay (ms)"
        name="cpuDelayMs"
        value={cpuDelayMs}
        min={0}
        max={10000}
      />

      <SelectField
        title="P1"
        name="p1Type"
        value={p1Type}
        options={PLAYER_TYPE_OPTIONS}
      />

      <SelectField
        title="P2"
        name="p2Type"
        value={p2Type}
        options={PLAYER_TYPE_OPTIONS}
      />

      <NumberField
        title="Duels to play"
        name="totalDuelsToPlay"
        value={totalDuelsToPlay}
        min={1}
      />

      <div>
        <label>
          Show Duel UI:{" "}
          <input
            name="showDuelUI"
            type="checkbox"
            onChange={onCheckboxChange}
            checked={showDuelUI}
          />
        </label>
      </div>

      <SelectField
        title="Deck 1"
        name="p1Name"
        value={p1Name}
        options={DUELLABLE_OPTIONS}
      />

      <SelectField
        title="Deck 2"
        name="p2Name"
        value={p2Name}
        options={DUELLABLE_OPTIONS}
      />
    </div>
  );
};

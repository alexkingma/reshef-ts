import { PlayerType } from "@/duel/common";
import { selectConfig } from "@/duel/duelSlice";
import { useDuelActions } from "@/duel/useDuelActions";
import { useAppSelector } from "@/hooks";
import React, { ChangeEvent } from "react";
import { NumberSelect } from "./NumberSelect";

export const DuelConfig = () => {
  const {
    computerDelayMs,
    p1Deck,
    p1Type,
    p2Deck,
    p2Type,
    totalDuelsToPlay,
    showDuelUI,
  } = useAppSelector(selectConfig);
  const { updateConfig } = useDuelActions();

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as PlayerType;
    const key = e.target.name as "p1Type" | "p2Type";
    updateConfig({ [key]: val });
  };

  const onCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked as boolean;
    const key = e.target.name as "showDuelUI";
    updateConfig({ [key]: val });
  };

  return (
    <div style={{ color: "white" }}>
      <h3>Config</h3>

      <NumberSelect
        title="Delay (ms)"
        name="computerDelayMs"
        val={computerDelayMs}
        // TODO: min 0, max 10,000
      />

      <div>
        <label>
          P1:{" "}
          <select name="p1Type" onChange={onSelectChange} value={p1Type}>
            <option value={PlayerType.Human}>Human</option>
            <option value={PlayerType.Computer}>Computer</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          P2:{" "}
          <select name="p2Type" onChange={onSelectChange} value={p2Type}>
            <option value={PlayerType.Human}>Human</option>
            <option value={PlayerType.Computer}>Computer</option>
          </select>
        </label>
      </div>

      <NumberSelect
        title="Duels to play"
        name="totalDuelsToPlay"
        val={totalDuelsToPlay}
        // TODO: min val of 1
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

      <div>Deck 1: {String(p1Deck)}</div>
      <div>Deck 2: {String(p2Deck)}</div>
    </div>
  );
};

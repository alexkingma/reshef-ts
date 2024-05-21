import { actions, selectConfig } from "@/duel/duelSlice";
import { DuelType, PlayerType } from "@/duel/enums/duel";
import { getDuellables } from "@/duel/util/duellistUtil";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { ChangeEvent, useCallback } from "react";
import { NumberField } from "./NumberField";
import { SelectField } from "./SelectField";

const { updateConfig } = actions;

interface Props {
  onDuelStart: () => void;
}

const PLAYER_TYPE_OPTIONS = [
  { label: "Human", value: PlayerType.Human },
  { label: "CPU", value: PlayerType.CPU },
];

const DUELLABLE_OPTIONS = getDuellables().map((d) => ({
  label: d.name,
  value: d.name,
}));

export const DuelConfig = ({ onDuelStart }: Props) => {
  const dispatch = useAppDispatch();
  const {
    duelType,
    cpuDelayMs,
    p1Name,
    p1Type,
    p2Name,
    p2Type,
    totalDuelsToPlay,
    showDuelUI,
  } = useAppSelector(selectConfig);

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const key = e.target.name as keyof DuelConfig;
      let val;
      switch (e.target.type) {
        case "checkbox":
          val = e.target.checked;
          break;
        case "radio":
          val = e.target.value;
          break;
        default:
          console.error(`Unexpected input type: ${e.target.type}`);
          return;
      }
      dispatch(updateConfig({ [key]: val }));
    },
    [dispatch]
  );

  return (
    <div className="config">
      <div style={{ color: "white" }}>
        <h2 style={{ display: "flex", justifyContent: "center" }}>Config</h2>

        <div>
          {Object.entries(DuelType).map(([key, val]) => (
            <label key={key}>
              <input
                type="radio"
                name="duelType"
                value={val}
                checked={duelType === val}
                onChange={onInputChange}
              />
              {val}
            </label>
          ))}
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

        {duelType === DuelType.Simulation && (
          <>
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
                  onChange={onInputChange}
                  checked={showDuelUI}
                />
              </label>
            </div>
          </>
        )}
      </div>
      <br />
      <button onClick={onDuelStart}>Start Duel</button>
    </div>
  );
};

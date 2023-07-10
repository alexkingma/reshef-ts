import { useDuelActions } from "@/duel/useDuelActions";
import React, { ChangeEvent } from "react";

type NumberFields = "totalDuelsToPlay" | "cpuDelayMs";

interface Props {
  name: NumberFields;
  title: string;
  val: number;
}

export const NumberSelect = ({ name, val, title }: Props) => {
  const { updateConfig } = useDuelActions();

  const onNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (Number.isNaN(val)) val = 0;
    const key = e.target.name as NumberFields;
    updateConfig({ [key]: val });
  };

  return (
    <div>
      <label>
        {title}:{" "}
        <input
          type="number"
          name={name}
          value={val}
          onChange={onNumberChange}
        />
      </label>
    </div>
  );
};

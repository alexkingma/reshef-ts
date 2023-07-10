import { useDuelActions } from "@/duel/useDuelActions";
import React, { ChangeEvent } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  title: string;
  value: number;
}

export const NumberField = ({ title, ...props }: Props) => {
  const { updateConfig } = useDuelActions();

  const onNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (Number.isNaN(val)) val = 0;
    const key = e.target.name as keyof DuelConfig;
    updateConfig({ [key]: val });
  };

  return (
    <div>
      <label>
        {title}: <input type="number" onChange={onNumberChange} {...props} />
      </label>
    </div>
  );
};

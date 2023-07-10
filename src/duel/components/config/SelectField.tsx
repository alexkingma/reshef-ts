import { useDuelActions } from "@/duel/useDuelActions";
import React, { ChangeEvent } from "react";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  title: string;
  value: any;
  options: { label: string; value: string }[];
}

export const SelectField = ({ title, options, ...props }: Props) => {
  const { updateConfig } = useDuelActions();

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const key = e.target.name as keyof DuelConfig;
    updateConfig({ [key]: val });
  };

  return (
    <div>
      <label>
        {title}:{" "}
        <select onChange={onSelectChange} {...props}>
          {options.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

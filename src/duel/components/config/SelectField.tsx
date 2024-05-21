import { actions } from "@/duel/duelSlice";
import { useAppDispatch } from "@/hooks";
import React, { ChangeEvent, useCallback } from "react";

const { updateConfig } = actions;

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  title: string;
  value: any;
  options: { label: string; value: string }[];
}

export const SelectField = ({ title, options, ...props }: Props) => {
  const dispatch = useAppDispatch();

  const onSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      const key = e.target.name as keyof DuelConfig;
      dispatch(updateConfig({ [key]: val }));
    },
    [dispatch]
  );

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

import { actions } from "@/duel/duelSlice";
import { useAppDispatch } from "@/hooks";
import React, { ChangeEvent, useCallback } from "react";

const { updateConfig } = actions;

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  title: string;
  value: number;
}

export const NumberField = ({ title, ...props }: Props) => {
  const dispatch = useAppDispatch();

  const onNumberChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let val = Number(e.target.value);
      if (Number.isNaN(val)) val = 0;
      const key = e.target.name as keyof DuelConfig;
      dispatch(updateConfig({ [key]: val }));
    },
    [dispatch]
  );

  return (
    <div>
      <label>
        {title}: <input type="number" onChange={onNumberChange} {...props} />
      </label>
    </div>
  );
};

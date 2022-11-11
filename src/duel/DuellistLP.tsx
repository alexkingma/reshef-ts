import React from "react";

import { PartialDispatchActions } from "./useDuelReducer";

type Props = Pick<DuellistDuelState, "lp"> &
  Pick<PartialDispatchActions, "addLP" | "subtractLP">;

export const DuellistLP = ({ lp, addLP, subtractLP }: Props) => {
  return (
    <>
      LP: {lp}&nbsp;
      <button onClick={() => addLP(1500)}>+1500</button>
      <button onClick={() => subtractLP(200)}>-200</button>
    </>
  );
};

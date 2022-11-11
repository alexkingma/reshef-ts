import React from "react";

import { DuelPartialDispatchActions } from "./useDuelReducer";

type Props = Pick<DuellistDuelState, "lp"> &
  Pick<DuelPartialDispatchActions, "addLP" | "subtractLP">;

export const DuellistLP = ({ lp, addLP, subtractLP }: Props) => {
  return (
    <>
      LP: {lp}&nbsp;
      <button onClick={() => addLP(1500)}>+1500</button>
      <button onClick={() => subtractLP(200)}>-200</button>
    </>
  );
};

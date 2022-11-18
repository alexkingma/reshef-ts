import React from "react";

import { DuelPartialDispatchActions } from "../coreDuelReducers";

type Props = Pick<DuellistDuelState, "lp"> & { isMyTurn: boolean } & Pick<
    DuelPartialDispatchActions,
    "addLP" | "subtractLP" | "endTurn"
  >;

export const DuellistStatus = ({
  lp,
  isMyTurn,
  addLP,
  subtractLP,
  endTurn,
}: Props) => {
  return (
    <>
      LP: {lp}&nbsp;
      <button onClick={() => addLP(1500)}>+1500</button>
      <button onClick={() => subtractLP(200)}>-200</button>
      <br />
      {isMyTurn ? <button onClick={endTurn}>End Turn</button> : null}
    </>
  );
};

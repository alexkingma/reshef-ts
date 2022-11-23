import React from "react";

import { DuelPartialDispatchActions } from "../coreDuelReducers";

type Props = Pick<DuellistDuelState, "lp"> & {
  name: string;
  isMyTurn: boolean;
} & Pick<DuelPartialDispatchActions, "addLP" | "subtractLP" | "endTurn">;

export const DuellistStatus = ({
  name,
  lp,
  isMyTurn,
  addLP,
  subtractLP,
  endTurn,
}: Props) => {
  return (
    <>
      <div style={{ display: "flex" }}>
        <h5>{name}</h5>
        {isMyTurn ? <button onClick={endTurn}>End Turn</button> : null}
      </div>
      <div>
        LP: {lp}&nbsp;
        <button onClick={() => addLP(1500)}>+1500</button>
        <button onClick={() => subtractLP(200)}>-200</button>
      </div>
    </>
  );
};

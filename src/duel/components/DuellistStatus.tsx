import React from "react";

import { DuelPartialDispatchActions } from "../coreDuelReducers";

type Props = Pick<DuellistDuelState, "lp"> & {
  name: string;
  isMyTurn: boolean;
} & Pick<DuelPartialDispatchActions, "endTurn">;

export const DuellistStatus = ({ name, lp, isMyTurn, endTurn }: Props) => {
  return (
    <>
      <div style={{ display: "flex" }}>
        <h5>{name}</h5>
        {isMyTurn ? <button onClick={endTurn}>End Turn</button> : null}
      </div>
      <div>LP: {lp}</div>
    </>
  );
};

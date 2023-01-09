import { selectDuellist, selectIsMyTurn } from "@/duel/duelSlice";
import { useDuellistActions } from "@/duel/useDuelActions";
import { useAppSelector } from "@/hooks";
import React from "react";

interface Props {
  duellistKey: DuellistKey;
  name: string;
}

export const DuellistStatus = ({ duellistKey, name }: Props) => {
  const { lp, graveyard } = useAppSelector(selectDuellist(duellistKey));
  const isMyTurn = useAppSelector(selectIsMyTurn(duellistKey));
  const { endTurn } = useDuellistActions(duellistKey);

  return (
    <>
      <div style={{ display: "flex" }}>
        <h5>{name}</h5>
        {isMyTurn ? <button onClick={() => endTurn()}>End Turn</button> : null}
      </div>
      <div>LP: {lp}</div>
      <div>Graveyard: {graveyard}</div>
    </>
  );
};

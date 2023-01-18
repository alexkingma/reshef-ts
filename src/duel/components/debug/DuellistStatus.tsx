import {
  selectActiveField,
  selectDuellist,
  selectGraveyardZone,
  selectIsMyTurn,
} from "@/duel/duelSlice";
import { useDuellistActions } from "@/duel/useDuelActions";
import { useAppSelector } from "@/hooks";
import React from "react";

interface Props {
  duellistKey: DuellistKey;
  name: string;
}

export const DuellistStatus = ({ duellistKey, name }: Props) => {
  const graveyardZone = useAppSelector(selectGraveyardZone(duellistKey));
  const { lp } = useAppSelector(selectDuellist(duellistKey));
  const isMyTurn = useAppSelector(selectIsMyTurn(duellistKey));
  const { endTurn } = useDuellistActions(duellistKey);
  const activeField = useAppSelector(selectActiveField(duellistKey));

  return (
    <>
      <div style={{ display: "flex" }}>
        <h5>{name}</h5>
        {isMyTurn ? <button onClick={() => endTurn()}>End Turn</button> : null}
      </div>
      <div>Field: {activeField || "Arena"}</div>
      <div>LP: {lp}</div>
      {graveyardZone.isOccupied ? (
        <div>Graveyard: {graveyardZone.card.name}</div>
      ) : (
        <div>
          <i>Empty</i>
        </div>
      )}
    </>
  );
};

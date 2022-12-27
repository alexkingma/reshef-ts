import React from "react";
import { useAppSelector } from "../../../hooks";
import { DuellistKey } from "../../common";
import { selectDuellist } from "../../duelSlice";
import { getCard } from "../../duelUtil";
import { VisibleCard } from "./VisibleCard";
import { Zone } from "./Zone";
import { ZoneBackground } from "./ZoneBackground";

interface Props {
  duellistKey: DuellistKey;
}

export const Graveyard = ({ duellistKey }: Props) => {
  const { graveyard } = useAppSelector(selectDuellist(duellistKey));

  return (
    <Zone>
      {graveyard ? (
        <VisibleCard card={getCard(graveyard)} />
      ) : (
        <ZoneBackground customClasses="graveyardBackground" />
      )}
    </Zone>
  );
};

import { DuellistKey } from "@/duel/common";
import { selectDuellist } from "@/duel/duelSlice";
import { getCard } from "@/duel/util/duelUtil";
import { useAppSelector } from "@/hooks";
import React from "react";
import { FaceUpCard } from "../card/FaceUpCard";
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
        <FaceUpCard card={getCard(graveyard)} />
      ) : (
        <ZoneBackground customClasses="graveyardBackground" />
      )}
    </Zone>
  );
};

import { DuellistKey } from "@/duel/common";
import { selectDuellist } from "@/duel/duelSlice";
import { getCard } from "@/duel/util/cardUtil";
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
        <div className="cardContainer">
          <FaceUpCard card={getCard(graveyard)} customClasses="alwaysVisible" />
        </div>
      ) : (
        <ZoneBackground customClasses="graveyardBackground" />
      )}
    </Zone>
  );
};

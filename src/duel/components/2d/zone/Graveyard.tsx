import { DuellistKey } from "@/duel/common";
import { selectGraveyardZone } from "@/duel/duelSlice";
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
  const z = useAppSelector(selectGraveyardZone(duellistKey));

  return (
    <Zone>
      {z.isOccupied ? (
        <div className="cardContainer">
          <FaceUpCard
            card={getCard(z.card.name)}
            customClasses="alwaysVisible"
          />
        </div>
      ) : (
        <ZoneBackground customClasses="graveyardBackground" />
      )}
    </Zone>
  );
};

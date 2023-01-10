import { selectDuel } from "@/duel/duelSlice";
import { getCard } from "@/duel/util/cardUtil";
import { useAppSelector } from "@/hooks";
import React from "react";
import { FaceUpCard } from "../card/FaceUpCard";
import { Zone } from "./Zone";
import { ZoneBackground } from "./ZoneBackground";

export const Field = () => {
  const { activeField } = useAppSelector(selectDuel);

  return (
    <Zone>
      {activeField !== "Arena" ? (
        <div className="cardContainer">
          <FaceUpCard
            card={getCard(activeField)}
            customClasses="alwaysVisible"
          />
        </div>
      ) : (
        <ZoneBackground customClasses={"fieldBackground"} />
      )}
    </Zone>
  );
};

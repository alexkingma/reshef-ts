import { RowKey } from "@/duel/common";
import { selectActiveField } from "@/duel/duelSlice";
import { getCard } from "@/duel/util/cardUtil";
import { useAppSelector } from "@/hooks";
import React from "react";
import { FaceUpCard } from "../card/FaceUpCard";
import { InteractiveZone } from "./InteractiveZone";
import { ZoneBackground } from "./ZoneBackground";

interface Props {
  duellistKey: DuellistKey;
}

export const Field = ({ duellistKey }: Props) => {
  const activeField = useAppSelector(selectActiveField(duellistKey));

  return (
    <InteractiveZone zoneCoords={[duellistKey, RowKey.Field, 0]}>
      {activeField ? (
        <div className="cardContainer">
          <FaceUpCard
            card={getCard(activeField as FieldName)}
            customClasses="alwaysVisible"
          />
        </div>
      ) : (
        <ZoneBackground customClasses={"fieldBackground"} />
      )}
    </InteractiveZone>
  );
};

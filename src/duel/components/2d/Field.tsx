import { selectDuel } from "@/duel/duelSlice";
import { getCard } from "@/duel/duelUtil";
import { useAppSelector } from "@/hooks";
import React from "react";
import { VisibleCard } from "./VisibleCard";
import { Zone } from "./Zone";
import { ZoneBackground } from "./ZoneBackground";

export const Field = () => {
  const { activeField } = useAppSelector(selectDuel);

  return (
    <Zone>
      {activeField !== "Arena" ? (
        <VisibleCard card={getCard(activeField)} />
      ) : (
        <ZoneBackground customClasses={"fieldBackground"} />
      )}
    </Zone>
  );
};

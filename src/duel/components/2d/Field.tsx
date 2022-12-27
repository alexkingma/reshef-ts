import React from "react";
import { useAppSelector } from "../../../hooks";
import { selectDuel } from "../../duelSlice";
import { getCard } from "../../duelUtil";
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

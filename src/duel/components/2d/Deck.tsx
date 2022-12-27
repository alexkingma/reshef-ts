import React from "react";
import { useAppSelector } from "../../../hooks";
import { selectDuellist } from "../../duelSlice";
import "./Deck.css";
import { HiddenCard } from "./HiddenCard";
import { Zone } from "./Zone";
import { ZoneBackground } from "./ZoneBackground";

interface Props {
  duellistKey: DuellistKey;
}

export const Deck = ({ duellistKey }: Props) => {
  const { deck } = useAppSelector(selectDuellist(duellistKey));

  return (
    <Zone>
      <div className="cardCount">{deck.length}</div>
      {!deck.length ? (
        <ZoneBackground customClasses={"deckBackground"} />
      ) : (
        <HiddenCard />
      )}
    </Zone>
  );
};

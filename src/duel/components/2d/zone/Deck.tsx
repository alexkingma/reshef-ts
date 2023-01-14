import { selectDuellist } from "@/duel/duelSlice";
import { useAppSelector } from "@/hooks";
import React from "react";
import { FaceDownCard } from "../card/FaceDownCard";
import "./Deck.scss";
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
        <div className="cardContainer">
          <FaceDownCard />
        </div>
      )}
    </Zone>
  );
};

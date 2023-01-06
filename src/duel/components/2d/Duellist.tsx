import { DuellistKey, RowKey } from "@/duel/common";
import React from "react";
import { Counterweight } from "./Counterweight";
import { Deck } from "./Deck";
import { DuellistStatus } from "./DuellistStatus";
import { Field } from "./Field";
import { Graveyard } from "./Graveyard";
import { Row } from "./Row";

interface Props {
  duellistKey: DuellistKey;
}

export const Duellist = ({ duellistKey }: Props) => {
  const isPlayer = duellistKey === DuellistKey.Player;

  return (
    <div
      style={{
        transform: isPlayer ? "" : "rotate(180deg)",
      }}
    >
      <div style={{ display: "flex" }}>
        <Field />
        <Row rowCoords={[duellistKey, RowKey.Monster]} />
        <Graveyard duellistKey={duellistKey} />
      </div>
      <div style={{ display: "flex" }}>
        <Counterweight />
        <Row rowCoords={[duellistKey, RowKey.SpellTrap]} />
        <Deck duellistKey={duellistKey} />
      </div>
      <div style={{ display: "flex" }}>
        <DuellistStatus duellistKey={duellistKey} />
        <Row rowCoords={[duellistKey, RowKey.Hand]} />
        <Counterweight />
      </div>
    </div>
  );
};

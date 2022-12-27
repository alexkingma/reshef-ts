import React from "react";
import { DuellistKey, RowKey } from "../../common";
import { Counterweight } from "./Counterweight";
import { Deck } from "./Deck";
import { Field } from "./Field";
import { Graveyard } from "./Graveyard";
import { Row } from "./Row";

interface Props {
  name: string;
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
      <Row rowCoords={[duellistKey, RowKey.Hand]} />
    </div>
  );
};

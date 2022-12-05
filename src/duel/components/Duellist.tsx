import React from "react";

import { DuellistDeck } from "./Deck";
import { DuellistHand } from "./Hand";
import { DuellistStatus } from "./DuellistStatus";
import { DuellistMonsterZones } from "./MonsterZones";
import { DuellistSpellTrapZones } from "./SpellTrapZones";

interface Props {
  name: string;
  duellistKey: DuellistKey;
}

export const Duellist = ({ name, duellistKey }: Props) => {
  return (
    <div>
      <DuellistStatus duellistKey={duellistKey} name={name} />
      <DuellistMonsterZones duellistKey={duellistKey} />
      <DuellistSpellTrapZones duellistKey={duellistKey} />
      <DuellistHand duellistKey={duellistKey} />
      <DuellistDeck duellistKey={duellistKey} />
    </div>
  );
};

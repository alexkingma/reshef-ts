import React from "react";

import { DuellistDeck } from "./DuellistDeck";
import { DuellistHand } from "./DuellistHand";
import { DuellistLP } from "./DuellistLP";
import { DuellistMonsterZones } from "./DuellistMonsterZones";
import { DuellistSpellTrapZones } from "./DuellistSpellTrapZones";

type Props = DuellistDuelState & {
  name: string;
  addLP: any;
  subtractLP: any;
  shuffle: any;
  drawCard: any;
  normalSummon: any;
  setSpellTrap: any;
};

export const Duellist = ({
  name,

  // duellistState
  lp,
  hand,
  deck,
  monsterZones,
  spellTrapZones,

  // dispatch/action combos
  addLP,
  subtractLP,
  shuffle,
  drawCard,
  normalSummon,
  setSpellTrap,
}: Props) => {
  return (
    <div>
      <h5>{name}</h5>
      <DuellistLP lp={lp} addLP={addLP} subtractLP={subtractLP} />
      <DuellistMonsterZones monsterZones={monsterZones} />
      <DuellistSpellTrapZones spellTrapZones={spellTrapZones} />
      <DuellistHand
        hand={hand}
        normalSummon={normalSummon}
        setSpellTrap={setSpellTrap}
      />
      <DuellistDeck deck={deck} shuffle={shuffle} drawCard={drawCard} />
    </div>
  );
};

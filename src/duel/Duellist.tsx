import React from "react";

import { DuellistDeck } from "./DuellistDeck";
import { DuellistHand } from "./DuellistHand";
import { DuellistLP } from "./DuellistLP";
import { DuellistMonsterZones } from "./DuellistMonsterZones";
import { DuellistSpellTrapZones } from "./DuellistSpellTrapZones";
import {
  DuellistPartialDispatchActions,
  DuelPartialDispatchActions,
} from "./useDuelReducer";

type Props = DuellistDuelState &
  DuellistPartialDispatchActions &
  DuelPartialDispatchActions & {
    name: string;
  };

export const Duellist = ({
  name,

  // duellistState
  lp,
  hand,
  deck,
  monsterZones,
  spellTrapZones,

  // duellist dispatch/action combos
  addLP,
  subtractLP,
  shuffle,
  drawCard,
  normalSummon,
  setSpellTrap,

  // cross-board dispatch/action combos
  attackMonster,
}: Props) => {
  return (
    <div>
      <h5>{name}</h5>
      <DuellistLP lp={lp} addLP={addLP} subtractLP={subtractLP} />
      <DuellistMonsterZones
        monsterZones={monsterZones}
        attackMonster={attackMonster}
      />
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

import React from "react";

import { DuellistDeck } from "./Deck";
import { DuellistHand } from "./Hand";
import { DuellistStatus } from "./DuellistStatus";
import { DuellistMonsterZones } from "./MonsterZones";
import { DuellistSpellTrapZones } from "./SpellTrapZones";
import { DuelPartialDispatchActions } from "../coreDuelReducers";

type Props = DuellistDuelState &
  DuelPartialDispatchActions & {
    name: string;
    isMyTurn: boolean;
  };

export const Duellist = ({
  name,
  isMyTurn,

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
  changeBattlePosition,
  endTurn,

  // cross-board dispatch/action combos
  attackMonster,
}: Props) => {
  return (
    <div>
      <h5>{name}</h5>
      <DuellistStatus
        lp={lp}
        addLP={addLP}
        subtractLP={subtractLP}
        isMyTurn={isMyTurn}
        endTurn={endTurn}
      />
      <DuellistMonsterZones
        monsterZones={monsterZones}
        attackMonster={attackMonster}
        changeBattlePosition={changeBattlePosition}
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

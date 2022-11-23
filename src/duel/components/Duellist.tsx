import React from "react";

import { DuellistDeck } from "./Deck";
import { DuellistHand } from "./Hand";
import { DuellistStatus } from "./DuellistStatus";
import { DuellistMonsterZones } from "./MonsterZones";
import { DuellistSpellTrapZones } from "./SpellTrapZones";
import { DuelPartialDispatchActions } from "../coreDuelReducers";
import { getNumTributesRequired } from "../duelUtil";

type Props = DuellistDuelState &
  Pick<DuelState, "activeTurn"> &
  DuelPartialDispatchActions & {
    name: string;
    duellistKey: DuellistKey;
  };

export const Duellist = ({
  name,
  duellistKey,

  // turn state
  activeTurn,

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
  tribute,

  // cross-board dispatch/action combos
  attackMonster,
}: Props) => {
  const isMyTurn = activeTurn.duellistKey === duellistKey;

  const canNormalSummon = (card: MonsterCard) => {
    const { hasNormalSummoned, numTributedMonsters } = activeTurn;
    if (!isMyTurn || hasNormalSummoned) return false;
    return numTributedMonsters >= getNumTributesRequired(card);
  };

  return (
    <div>
      <DuellistStatus
        name={name}
        lp={lp}
        isMyTurn={isMyTurn}
        addLP={addLP}
        subtractLP={subtractLP}
        endTurn={endTurn}
      />
      <DuellistMonsterZones
        monsterZones={monsterZones}
        attackMonster={attackMonster}
        changeBattlePosition={changeBattlePosition}
        tribute={tribute}
      />
      <DuellistSpellTrapZones spellTrapZones={spellTrapZones} />
      <DuellistHand
        hand={hand}
        canNormalSummon={canNormalSummon}
        normalSummon={normalSummon}
        setSpellTrap={setSpellTrap}
      />
      <DuellistDeck deck={deck} shuffle={shuffle} drawCard={drawCard} />
    </div>
  );
};

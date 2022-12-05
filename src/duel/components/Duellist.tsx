import React from "react";

import { DuellistDeck } from "./Deck";
import { DuellistHand } from "./Hand";
import { DuellistStatus } from "./DuellistStatus";
import { DuellistMonsterZones } from "./MonsterZones";
import { DuellistSpellTrapZones } from "./SpellTrapZones";
import { DuelPartialDispatchActions } from "../coreDuelReducers";
import { getNumTributesRequired } from "../duelUtil";
import { SpellDispatchActions } from "../spellEffectReducers";

type Props = Duellist &
  Pick<Duel, "activeTurn"> &
  DuelPartialDispatchActions & {
    name: string;
    duellistKey: DuellistKey;
    spellEffectDispatches: SpellDispatchActions;
  };

export const Duellist = ({
  name,
  duellistKey,

  // turn state
  activeTurn,

  // duellist state
  lp,
  deck,
  graveyard,
  hand,
  monsterZones,
  spellTrapZones,

  // duellist dispatch/action combos
  shuffle,
  drawCard,
  normalSummon,
  setSpellTrap,
  changeBattlePosition,
  endTurn,
  tribute,
  discard,

  // cross-board dispatch/action combos
  attackMonster,

  // spell effect dispatcher
  spellEffectDispatches,
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
        graveyard={graveyard}
        isMyTurn={isMyTurn}
        endTurn={endTurn}
      />
      <DuellistMonsterZones
        monsterZones={monsterZones}
        isMyTurn={isMyTurn}
        attackMonster={attackMonster}
        changeBattlePosition={changeBattlePosition}
        tribute={tribute}
        discard={discard}
      />
      <DuellistSpellTrapZones
        duellistKey={duellistKey}
        spellTrapZones={spellTrapZones}
        isMyTurn={isMyTurn}
        discard={discard}
        spellEffectDispatches={spellEffectDispatches}
      />
      <DuellistHand
        hand={hand}
        isMyTurn={isMyTurn}
        canNormalSummon={canNormalSummon}
        normalSummon={normalSummon}
        setSpellTrap={setSpellTrap}
        discard={discard}
      />
      <DuellistDeck deck={deck} shuffle={shuffle} drawCard={drawCard} />
    </div>
  );
};

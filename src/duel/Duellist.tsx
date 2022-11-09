import React from "react";

import { DuellistDeck } from "./DuellistDeck";
import { DuellistHand } from "./DuellistHand";
import { DuellistLP } from "./DuellistLP";
import { DuellistMonsterZones } from "./DuellistMonsterZones";
import useDuelReducer from "./useDuellistReducer";

interface Props {
  name: string;
  cardQuantMap: CardQuantityMap;
}

export const Duellist = ({ name, cardQuantMap }: Props) => {
  const { state, dispatchActions } = useDuelReducer(cardQuantMap);
  const { lp, hand, deck, monsterZones } = state;
  const { addLP, subtractLP, shuffle, drawCard, summonMonster } =
    dispatchActions;

  return (
    <div>
      <h5>{name}</h5>
      <DuellistLP lp={lp} addLP={addLP} subtractLP={subtractLP} />
      <DuellistMonsterZones
        monsterZones={monsterZones}
        summonMonster={summonMonster}
      />
      <DuellistHand hand={hand} />
      <DuellistDeck deck={deck} shuffle={shuffle} drawCard={drawCard} />
    </div>
  );
};

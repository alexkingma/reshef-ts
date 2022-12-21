import React, { useEffect } from "react";
import { DuellistDeck } from "./Deck";
import { DuellistStatus } from "./DuellistStatus";
import { useAppSelector } from "../../hooks";
import { selectDuellist } from "../duelSlice";
import { MonsterZone } from "./MonsterZone";
import { EmptyZone } from "./EmptyZone";
import { SpellTrapZone } from "./SpellTrapZone";
import { HandZone } from "./HandZone";
import { RowKey } from "../common";
import { useDuellistActions } from "../useDuellistActions";
import { isStartOfTurn } from "../duelUtil";

interface Props {
  name: string;
  duellistKey: DuellistKey;
}

export const Duellist = ({ name, duellistKey }: Props) => {
  const { monsterZones, spellTrapZones, hand } = useAppSelector(
    selectDuellist(duellistKey)
  );
  const state = useAppSelector(({ duel }) => duel);
  const { startTurn } = useDuellistActions(duellistKey);

  useEffect(() => {
    if (isStartOfTurn(state, duellistKey)) {
      startTurn();
    }
  }, [state.activeTurn.isStartOfTurn]);

  return (
    <div style={{ minWidth: "400px" }}>
      <DuellistStatus duellistKey={duellistKey} name={name} />
      <div>
        Monster Zones:
        <ol>
          {monsterZones.map((z, i) => (
            <li key={i}>
              {z.isOccupied ? (
                <MonsterZone
                  zoneCoords={[duellistKey, RowKey.Monster, i as FieldCol]}
                />
              ) : (
                <EmptyZone key={i} />
              )}
            </li>
          ))}
        </ol>
      </div>

      <div>
        Spell/Trap Zones:
        <ol>
          {spellTrapZones.map((z, i) => (
            <li key={i}>
              {z.isOccupied ? (
                <SpellTrapZone
                  zoneCoords={[duellistKey, RowKey.SpellTrap, i as FieldCol]}
                />
              ) : (
                <EmptyZone key={i} />
              )}
            </li>
          ))}
        </ol>
      </div>

      <div>
        Hand:
        <ol>
          {hand.map((z, i) => (
            <li key={i}>
              {z.isOccupied ? (
                <HandZone
                  zoneCoords={[duellistKey, RowKey.Hand, i as FieldCol]}
                />
              ) : (
                <EmptyZone key={i} />
              )}
            </li>
          ))}
        </ol>
      </div>
      <DuellistDeck duellistKey={duellistKey} />
    </div>
  );
};

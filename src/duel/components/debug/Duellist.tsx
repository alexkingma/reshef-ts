import { RowKey } from "@/duel/common";
import { selectDuellist } from "@/duel/duelSlice";
import { useAppSelector } from "@/hooks";
import React from "react";
import { Deck } from "./Deck";
import { DuellistStatus } from "./DuellistStatus";
import { EmptyZone } from "./EmptyZone";
import { HandZone } from "./HandZone";
import { MonsterZone } from "./MonsterZone";
import { SpellTrapZone } from "./SpellTrapZone";

interface Props {
  name: string;
  duellistKey: DuellistKey;
}

export const Duellist = ({ name, duellistKey }: Props) => {
  const { monsterZones, spellTrapZones, hand, activeEffects } = useAppSelector(
    selectDuellist(duellistKey)
  );

  return (
    <div style={{ minWidth: "400px" }}>
      <DuellistStatus duellistKey={duellistKey} name={name} />
      <div>BC Zones: {activeEffects.brainControlZones.toString()}</div>
      <div>SoRL Turns Remaining: {activeEffects.sorlTurnsRemaining}</div>
      <div>
        Monster Zones:
        <ol>
          {monsterZones.map((z, i) => (
            <li key={i}>
              {z.isOccupied ? (
                <MonsterZone zoneCoords={[duellistKey, RowKey.Monster, i]} />
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
                  zoneCoords={[duellistKey, RowKey.SpellTrap, i]}
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
                <HandZone zoneCoords={[duellistKey, RowKey.Hand, i]} />
              ) : (
                <EmptyZone key={i} />
              )}
            </li>
          ))}
        </ol>
      </div>
      <Deck duellistKey={duellistKey} />
    </div>
  );
};

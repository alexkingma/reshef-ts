import React from "react";

import { DuellistDeck } from "./Deck";
import { DuellistStatus } from "./DuellistStatus";
import { useAppSelector } from "../../hooks";
import { selectDuellist } from "../duelSlice";
import { MonsterZone } from "./MonsterZone";
import { EmptyZone } from "./EmptyZone";
import { SpellTrapZone } from "./SpellTrapZone";
import { HandZone } from "./HandZone";

interface Props {
  name: string;
  duellistKey: DuellistKey;
}

export const Duellist = ({ name, duellistKey }: Props) => {
  const { monsterZones, spellTrapZones, hand } = useAppSelector(
    selectDuellist(duellistKey)
  );

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
                  zone={z}
                  zoneIdx={i as FieldCol}
                  duellistKey={duellistKey}
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
                  zone={z}
                  zoneIdx={i as FieldCol}
                  duellistKey={duellistKey}
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
                  zone={z}
                  zoneIdx={i as FieldCol}
                  duellistKey={duellistKey}
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

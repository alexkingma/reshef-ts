import React from "react";

interface Props {
  spellTrapZones: SpellTrapZone[];
}

export const DuellistSpellTrapZones = ({ spellTrapZones }: Props) => {
  return (
    <div>
      Spell/Trap Zones:
      <ol>
        {spellTrapZones.map((zone, idx) => {
          if (!zone.isOccupied) {
            return (
              <li key={idx}>
                <i>Empty</i>
              </li>
            );
          }
          const { card } = zone;
          return <li key={idx}>{card.name}</li>;
        })}
      </ol>
    </div>
  );
};

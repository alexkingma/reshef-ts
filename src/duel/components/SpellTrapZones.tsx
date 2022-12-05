import React from "react";
import { FieldRow, Spell } from "../common";
import { DuelPartialDispatchActions } from "../coreDuelReducers";
import { SpellDispatchActions } from "../spellEffectReducers";

type Props = Pick<Duellist, "spellTrapZones"> &
  Pick<DuelPartialDispatchActions, "discard"> & {
    duellistKey: DuellistKey;
    isMyTurn: boolean;
    spellEffectDispatches: SpellDispatchActions;
  };

export const DuellistSpellTrapZones = ({
  duellistKey,
  spellTrapZones,
  isMyTurn,
  discard,
  spellEffectDispatches,
}: Props) => {
  const activateSpellEffect = (cardName: CardName, idx: FieldCol) => {
    const spellDispatch = spellEffectDispatches[cardName as Spell];
    if (!spellDispatch) {
      console.log(`Spell effect not implemented for card: ${cardName}`);
      return;
    }
    spellDispatch(duellistKey);
    discard([FieldRow.PlayerSpellTrap, idx]);
  };

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
          return (
            <li key={idx}>
              {card.name}
              {isMyTurn ? (
                <>
                  <button
                    onClick={() =>
                      activateSpellEffect(card.name, idx as FieldCol)
                    }
                  >
                    Activate
                  </button>
                  <button
                    onClick={() =>
                      discard([FieldRow.PlayerSpellTrap, idx as FieldCol])
                    }
                  >
                    Discard
                  </button>
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

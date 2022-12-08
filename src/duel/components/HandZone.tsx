import React from "react";
import { useAppSelector } from "../../hooks";
import { FieldRow } from "../common";
import { selectActiveTurn, selectDuellist, selectIsMyTurn } from "../duelSlice";
import { isMonster } from "../duelUtil";
import useDuelActions from "../useDuelActions";
import { MonsterZone } from "./MonsterZone";

interface Props {
  duellistKey: DuellistKey;
  zone: OccupiedZone;
  zoneIdx: FieldCol;
}

export const HandZone = ({ duellistKey, zone, zoneIdx }: Props) => {
  const { hand } = useAppSelector(selectDuellist(duellistKey));
  const isMyTurn = useAppSelector(selectIsMyTurn(duellistKey));
  const { hasNormalSummoned, numTributedMonsters } =
    useAppSelector(selectActiveTurn);
  const { normalSummon, setSpellTrap, discard } = useDuelActions(duellistKey);

  const canNormalSummon = (card: MonsterCard) => {
    return true; // DEBUG ONLY
    // if (!isMyTurn || hasNormalSummoned) return false;
    // return numTributedMonsters >= getNumTributesRequired(card);
  };

  const { card } = zone;
  return (
    <>
      {isMonster(zone) ? (
        <MonsterZone duellistKey={duellistKey} zone={zone} zoneIdx={zoneIdx} />
      ) : null}
      {isMonster(zone) ? (
        <>
          {canNormalSummon(card as MonsterCard) ? (
            <button onClick={() => normalSummon(zoneIdx)}>Summon</button>
          ) : null}
        </>
      ) : (
        <button onClick={() => setSpellTrap(zoneIdx)}>Set</button>
      )}
      {isMyTurn ? (
        <button onClick={() => discard([FieldRow.PlayerHand, zoneIdx])}>
          Discard
        </button>
      ) : null}
    </>
  );
};

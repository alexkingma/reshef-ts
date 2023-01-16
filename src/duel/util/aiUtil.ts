import { RowKey } from "../common";
import { getNumTributesRequired } from "./cardUtil";
import { countMatchesInRow } from "./rowUtil";
import { getZone, isMonster } from "./zoneUtil";

export const canAISummon = (state: Duel, summonableCoords: ZoneCoords) => {
  // AI prefers to summon the strongest monster it has
  // however, it must have enough tributes available that are weaker than it
  const [dKey] = summonableCoords;
  const handZone = getZone(state, summonableCoords) as OccupiedMonsterZone;
  const numTributesRequired = getNumTributesRequired(handZone.card);
  if (numTributesRequired === 0) return true;
  const numTributesAvailable = countMatchesInRow(
    state,
    [dKey, RowKey.Monster],
    (z) => isMonster(z) && !z.isLocked && z.card.effAtk < handZone.card.effAtk
  );
  return numTributesAvailable >= numTributesRequired;
};

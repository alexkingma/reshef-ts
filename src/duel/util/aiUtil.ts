import { RowKey } from "../common";
import { getNumTributesRequired } from "./cardUtil";
import { getRow } from "./rowUtil";
import { getZone } from "./zoneUtil";

export const canAISummonMonster = (
  state: Duel,
  summonableCoords: ZoneCoords
) => {
  // AI always summons the strongest monster possible.
  // However, it must have enough tributes available that are weaker than it.
  // Technically, it should also have a free zone to summon at, or a weaker mon to
  // replace, but this condition is automatically covered by a weaker tributeable
  // monster existing, as per the aforementioned check, so no extra code is needed.
  const [dKey] = summonableCoords;
  const handZone = getZone(state, summonableCoords) as OccupiedMonsterZone;
  const numTributesRequired = getNumTributesRequired(handZone.card);
  const currentTributes = state.activeTurn.numTributedMonsters;
  if (currentTributes >= numTributesRequired) return true;
  const numTributesAvailable = getMonsterIdxsByTributeable(
    state,
    dKey,
    handZone.card.effAtk
  ).length;
  return currentTributes + numTributesAvailable >= numTributesRequired;
};

export const getMonsterIdxsByTributeable = (
  state: Duel,
  dKey: DuellistKey,
  atkThreshold: number
) => {
  // Low-atk mons should be tributed before higher-atk mons.
  // Generate an array of mon idxs, sorted in desc order of how disposable they are.
  const monsterZones = getRow(state, [dKey, RowKey.Monster]) as MonsterZone[];
  return monsterZones
    .map((_, i) => i)
    .filter((i) => {
      const z = monsterZones[i] as OccupiedMonsterZone;
      return z.isOccupied && z.card.effAtk < atkThreshold;
    })
    .sort((aI, bI) => {
      const a = monsterZones[aI] as OccupiedMonsterZone;
      const b = monsterZones[bI] as OccupiedMonsterZone;
      if (b.card.effAtk === a.card.effAtk) {
        return a.card.effDef - b.card.effDef;
      }
      return a.card.effAtk - b.card.effAtk;
    });
};

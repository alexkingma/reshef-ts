import { RowKey } from "../common";
import { getNumTributesRequired } from "./cardUtil";
import { getOtherDuellistKey } from "./duellistUtil";
import { getRow, hasMatchInRow } from "./rowUtil";
import { calculateAttack, getZone } from "./zoneUtil";

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

export const getWeakestVictorIdx = (
  state: Duel,
  dKey: DuellistKey,
  targetIdx: number
) => {
  // When attacking a face-up enemy mon, the AI will use its weakest
  // monster that will still destroy the opponent card.

  if (
    !hasMatchInRow(
      state,
      [dKey, RowKey.Monster],
      (z) => !(z as OccupiedMonsterZone).isLocked
    )
  ) {
    // no monsters to attack with
    return -1;
  }

  const targetZone = getZone(state, [
    getOtherDuellistKey(dKey),
    RowKey.Monster,
    targetIdx,
  ]) as OccupiedMonsterZone;
  const attackerZones = getRow(state, [
    dKey,
    RowKey.Monster,
  ]) as OccupiedMonsterZone[];
  const [weakestAttackerIdx] = attackerZones
    .map((_, i) => i)
    .filter((i) => attackerZones[i].isOccupied && !attackerZones[i].isLocked)
    .sort((aI, bI) => {
      const a = attackerZones[aI] as OccupiedMonsterZone;
      const b = attackerZones[bI] as OccupiedMonsterZone;
      const {
        targetDestroyed: targetDestroyedA,
        attackerDestroyed: attackerDestroyedA,
      } = calculateAttack(a, targetZone);
      const {
        targetDestroyed: targetDestroyedB,
        attackerDestroyed: attackerDestroyedB,
      } = calculateAttack(b, targetZone);
      if (
        targetDestroyedA === targetDestroyedB &&
        attackerDestroyedA === attackerDestroyedB
      ) {
        // between attackers who both destroy the target, and both survive
        // the encounter, prefer the lowest atk of the two
        return a.card.effAtk - b.card.effAtk;
      }

      if (targetDestroyedA === targetDestroyedB) {
        // prefer not destroying self if another path can destroy target without that
        return +attackerDestroyedA - +attackerDestroyedB;
      }

      // always prefer destroying target over not destroying it
      return +targetDestroyedB - +targetDestroyedA;
    });

  // Zones are sorted from the best attacker to worst. However, best might still
  // be a failed attack; if so, return -1 instead of its idx.
  const { targetDestroyed } = calculateAttack(
    attackerZones[weakestAttackerIdx],
    targetZone
  );
  return targetDestroyed ? weakestAttackerIdx : -1;
};

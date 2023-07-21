import { BattlePosition, RowKey } from "../common";
import { getNumTributesRequired } from "./cardUtil";
import { getOtherDuellistKey } from "./duellistUtil";
import {
  countMatchesInRow,
  getHighestAtkZoneIdx,
  getLowestAtkZoneIdx,
  getRow,
  hasEmptyZone,
  hasMatchInRow,
} from "./rowUtil";
import {
  calculateAttack,
  getZone,
  isFaceDown,
  isFaceUp,
  isUnlocked,
} from "./zoneUtil";

export const canAISummonMonster = (
  state: Duel,
  summonableCoords: ZoneCoords
) => {
  // AI always summons the strongest monster possible.
  // However, it must have enough tributes available that are weaker than it.
  const [dKey] = summonableCoords;
  const handZone = getZone(state, summonableCoords) as OccupiedMonsterZone;
  const numTributesRequired = getNumTributesRequired(handZone.card);
  const currentTributes = state.activeTurn.numTributedMonsters;
  const numTributesAvailable = getMonsterIdxsByTributeable(
    state,
    dKey,
    handZone.card.effAtk
  ).length;

  // If AI has no space to summon, must have >= one mon weaker than it
  // to summon on top of. This is only really relevant when evaluating
  // monsters that require no actual tributes can be summoned.
  // e.g. can't summon Kuriboh on a board of 5 Slifers, even though it
  // should require 0 tributes.
  const hasFreeMonsterZone = hasEmptyZone(state, [
    state.activeTurn.duellistKey,
    RowKey.Monster,
  ]);

  return (
    currentTributes + numTributesAvailable >=
    Math.max(numTributesRequired, hasFreeMonsterZone ? 0 : 1)
  );
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

export const getFaceUpAttacker = (
  state: Duel,
  dKey: DuellistKey,
  rejectedIdxs: number[]
) => {
  return getLowestAtkZoneIdx(
    state,
    [dKey, RowKey.Monster],
    (z, i) => isUnlocked(z) && !rejectedIdxs.includes(i)
  );
};

export const getFaceUpTarget = (state: Duel, attackerCoords: ZoneCoords) => {
  const [dKey, rKey] = attackerCoords;
  const otherMonsters: RowCoords = [getOtherDuellistKey(dKey), RowKey.Monster];

  // The AI will allow mutual destruction, provided the current attacker is not
  // the AI's last monster on the field.
  const isLastOwnMonster = countMatchesInRow(state, [dKey, rKey]) === 1;

  return getHighestAtkZoneIdx(state, otherMonsters, (z, i) => {
    if (!isFaceUp(z)) return false;
    const targetCoords: ZoneCoords = [...otherMonsters, i];
    const { targetDestroyed, attackerDestroyed } = calculateAttack(
      state,
      attackerCoords,
      targetCoords
    );
    return targetDestroyed && (!isLastOwnMonster || !attackerDestroyed);
  });
};

export const getIdealBattlePos = (
  state: Duel,
  originCoords: ZoneCoords
): BattlePosition => {
  const [dKey] = originCoords;
  const otherMonsters: RowCoords = [getOtherDuellistKey(dKey), RowKey.Monster];

  if (hasMatchInRow(state, otherMonsters, isFaceDown)) {
    // a defence pos monster exists and we can't attack it (SoRL, say)
    return BattlePosition.Defence;
  }

  const originZone = getZone(state, originCoords) as OccupiedMonsterZone;
  const targetIdx = getHighestAtkZoneIdx(state, otherMonsters, isFaceUp);
  if (targetIdx === -1) {
    // no opponent mons exist, determine what is best for origin in isolation
    return originZone.card.effDef >= originZone.card.effAtk
      ? BattlePosition.Defence
      : BattlePosition.Attack;
  }

  const targetCoords: ZoneCoords = [...otherMonsters, targetIdx];
  const targetZone = getZone(state, targetCoords) as OccupiedMonsterZone;

  // a faceup opponent mon exists, determine best pos based on
  // if it's stronger or weaker than origin card
  return targetZone.card.effAtk > originZone.card.effAtk
    ? BattlePosition.Defence
    : BattlePosition.Attack;
};

export const getLethalAttackerTarget = (
  state: Duel,
  dKey: DuellistKey
): { attackerIdx: number; targetIdx?: number } | false => {
  const ownMonsters: RowCoords = [dKey, RowKey.Monster];
  const otherDKey = getOtherDuellistKey(dKey);
  const otherMonsters: RowCoords = [otherDKey, RowKey.Monster];

  // no monsters to attack with, lethal is impossible
  if (!hasMatchInRow(state, ownMonsters, isUnlocked)) return false;

  const opponentLp = state[otherDKey].lp;
  const attackerZones = getRow(state, ownMonsters) as OccupiedMonsterZone[];
  const targetZones = getRow(state, otherMonsters) as OccupiedMonsterZone[];

  for (const [attackerIdx, attackerZone] of attackerZones.entries()) {
    const attackerCoords: ZoneCoords = [...ownMonsters, attackerIdx];
    if (!isUnlocked(attackerZone)) continue;

    // if opponent has no monsters, lethal takes the form of a direct attack
    if (
      !hasMatchInRow(state, otherMonsters) &&
      attackerZone.card.effAtk >= opponentLp
    ) {
      return { attackerIdx };
    }

    // If the opponent has faceup (attack pos) monsters, lethal must involve
    // dealing collateral lp damage through a mon-vs-mon attack.
    for (const [targetIdx, targetZone] of targetZones.entries()) {
      if (!targetZone.isOccupied || isFaceDown(targetZone)) continue;

      const targetCoords: ZoneCoords = [...otherMonsters, targetIdx];
      const { targetLpLoss } = calculateAttack(
        state,
        attackerCoords,
        targetCoords
      );

      // collateral lp damage not great enough
      if (targetLpLoss < opponentLp) continue;

      return { attackerIdx, targetIdx };
    }
  }

  return false;
};

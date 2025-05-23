import { BattlePosition, DKey, RowKey } from "../enums/duel";
import { getCard, getNumTributesRequired } from "./cardUtil";
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
  isEmpty,
  isFaceDown,
  isFaceUp,
  isMaxAtk,
  isOccupied,
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
  const handCard = getCard(handZone.id) as MonsterCard;
  const numTributesRequired = getNumTributesRequired(handCard);
  const currentTributes = state.activeTurn.numTributedMonsters;
  const numTributesAvailable = countMatchesInRow(
    state,
    [dKey, RowKey.Monster],
    (z) => isMaxAtk(z, handZone.effAtk - 1)
  );

  // If AI has no space to summon, must have >= 1 mon weaker than it
  // to summon on top of. This is only really relevant when evaluating
  // monsters that require no actual tributes can be summoned.
  // e.g. can't summon Kuriboh on a board of 5 Slifers, even though it
  // should require 0 tributes.
  const hasFreeMonsterZone = hasEmptyZone(state, [
    state.activeTurn.dKey,
    RowKey.Monster,
  ]);

  return (
    currentTributes + numTributesAvailable >=
    Math.max(numTributesRequired, hasFreeMonsterZone ? 0 : 1)
  );
};

export const getMonsterIdxsByTributeable = (
  state: Duel,
  dKey: DKey,
  atkThreshold: number
) => {
  // Low-atk mons should be tributed before higher-atk mons.
  // Generate an array of mon idxs, sorted in desc order of how disposable they are.
  const row = getRow(state, [dKey, RowKey.Monster]);

  // for-loop is 2x faster than map/filter
  const idxs: number[] = [];
  for (let i = 0; i < row.length; i++) {
    const z = row[i] as MonsterZone;
    if (isOccupied(z) && z.effAtk < atkThreshold) {
      idxs.push(i);
    }
  }

  return idxs.sort((aI, bI) => {
    const a = row[aI] as OccupiedMonsterZone;
    const b = row[bI] as OccupiedMonsterZone;
    if (b.effAtk === a.effAtk) {
      return a.effDef - b.effDef;
    }
    return a.effAtk - b.effAtk;
  });
};

export const getFaceUpAttacker = (
  state: Duel,
  dKey: DKey,
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
    return originZone.effDef >= originZone.effAtk
      ? BattlePosition.Defence
      : BattlePosition.Attack;
  }

  const targetCoords: ZoneCoords = [...otherMonsters, targetIdx];
  const targetZone = getZone(state, targetCoords) as OccupiedMonsterZone;

  // a faceup opponent mon exists, determine best pos based on
  // if it's stronger or weaker than origin card
  return targetZone.effAtk > originZone.effAtk
    ? BattlePosition.Defence
    : BattlePosition.Attack;
};

export const getLethalAttackerTarget = (
  state: Duel,
  dKey: DKey
): { attackerIdx: number; targetIdx?: number } | false => {
  const ownMonsters: RowCoords = [dKey, RowKey.Monster];
  const otherDKey = getOtherDuellistKey(dKey);
  const otherMonsters: RowCoords = [otherDKey, RowKey.Monster];

  // no monsters to attack with, lethal is impossible
  if (!hasMatchInRow(state, ownMonsters, isUnlocked)) return false;

  const opponentLp = state.duellists[otherDKey].lp;
  const attackerZones = getRow(state, ownMonsters) as OccupiedMonsterZone[];
  const targetZones = getRow(state, otherMonsters) as OccupiedMonsterZone[];

  for (const [attackerIdx, attackerZone] of attackerZones.entries()) {
    const attackerCoords: ZoneCoords = [...ownMonsters, attackerIdx];
    if (!isUnlocked(attackerZone)) continue;

    // if opponent has no monsters, lethal takes the form of a direct attack
    if (
      !hasMatchInRow(state, otherMonsters) &&
      attackerZone.effAtk >= opponentLp
    ) {
      return { attackerIdx };
    }

    // If the opponent has faceup (attack pos) monsters, lethal must involve
    // dealing collateral lp damage through a mon-vs-mon attack.
    for (const [targetIdx, targetZone] of targetZones.entries()) {
      if (isEmpty(targetZone) || isFaceDown(targetZone)) continue;

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

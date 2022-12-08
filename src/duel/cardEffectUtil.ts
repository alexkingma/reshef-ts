import { calculateAttack } from "./combatUtil";
import {
  BattlePosition,
  Field,
  FieldCoords,
  FieldRow,
  Monster,
  Orientation,
} from "./common";
import { ReducerArg } from "./duelSlice";
import {
  countMatchesInRow,
  generateOccupiedMonsterZone,
  getCard,
  getFirstEmptyZoneIdx,
  getFirstMatchInRowIdx,
  getFirstOccupiedZoneIdx,
  getHighestAtkZoneIdx,
  getNumCardsInRow,
  getZoneKey,
  isTrap,
} from "./duelUtil";

export const permPowerUp = (
  duellist: Duellist,
  monsterIdx: FieldCol,
  levels: number = 1
) => {
  const zone = duellist.monsterZones[monsterIdx] as OccupiedMonsterZone;
  zone.permPowerUpLevel += levels;
};

export const tempPowerUp = (
  duellist: Duellist,
  monsterIdx: FieldCol,
  levels: number = 1
) => {
  const zone = duellist.monsterZones[monsterIdx] as OccupiedMonsterZone;
  zone.tempPowerUpLevel += levels;
};

export const permPowerDown = (
  duellist: Duellist,
  monsterIdx: FieldCol,
  levels: number = 1
) => {
  permPowerUp(duellist, monsterIdx, -levels);
};

export const tempPowerDown = (
  duellist: Duellist,
  monsterIdx: FieldCol,
  levels: number = 1
) => {
  tempPowerUp(duellist, monsterIdx, -levels);
};

export const destroyRow = (state: Duellist, row: FieldRow) => {
  state[getZoneKey(row)].forEach((zone, idx) => {
    if (zone.isOccupied) {
      destroyAtCoords(state, [row, idx as FieldCol]);
    }
  });
};

export const destroyAtCoords = (state: Duellist, coords: FieldCoords) => {
  const [row, col] = coords;
  const zone = state[getZoneKey(row)][col];
  if (!zone.isOccupied) return;
  if (zone.card.category === "Monster") {
    state.graveyard = zone.card.name;
  }
  clearZone(state[getZoneKey(row)], col);
};

export const clearGraveyard = (duellist: Duellist) => {
  duellist.graveyard = null;
};

export const clearZone = (row: Zone[], idx: number) => {
  // does NOT send anything to graveyard
  row[idx] = { isOccupied: false };
};

export const clearZones = (row: Zone[], idxs: number[]) => {
  idxs.forEach((idx) => clearZone(row, idx));
};

const setRowOrientation = (row: Zone[], orientation: Orientation) => {
  row.forEach((zone, idx, row) => {
    if (!zone.isOccupied) return;
    (row[idx] as OccupiedZone).orientation = orientation;
  });
};

export const setRowFaceUp = (row: Zone[]) => {
  setRowOrientation(row, Orientation.FaceUp);
};

export const setRowFaceDown = (row: Zone[]) => {
  setRowOrientation(row, Orientation.FaceDown);
};

export const immobiliseCard = (zone: OccupiedMonsterZone) => {
  zone.isLocked = true;
};

export const immobiliseRow = (row: MonsterZone[]) => {
  row.forEach((zone, idx, zones) => {
    if (!zone.isOccupied) return;
    immobiliseCard(zones[idx] as OccupiedMonsterZone);
  });
};

export const directAttack = (
  originatorState: Duellist,
  targetState: Duellist,
  attackerIdx: FieldCol
) => {
  const zone = originatorState.monsterZones[attackerIdx] as OccupiedMonsterZone;
  targetState.lp -= zone.card.effAtk;
};

export const attackMonster = (
  originatorState: Duellist,
  targetState: Duellist,
  attackerIdx: FieldCol,
  targetIdx: FieldCol
) => {
  const attackerZone = originatorState.monsterZones[
    attackerIdx
  ] as OccupiedMonsterZone;
  const targetZone = targetState.monsterZones[targetIdx] as OccupiedMonsterZone;
  const { attackerDestroyed, targetDestroyed, attackerLpLoss, targetLpLoss } =
    calculateAttack(attackerZone, targetZone);
  if (attackerDestroyed) {
    destroyAtCoords(originatorState, [FieldRow.PlayerMonster, attackerIdx]);
  }
  if (targetDestroyed) {
    destroyAtCoords(targetState, [FieldRow.OpponentMonster, targetIdx]);
  }
  if (attackerLpLoss) {
    originatorState.lp -= attackerLpLoss;
  }
  if (targetLpLoss) {
    targetState.lp -= targetLpLoss;
  }
};

export const destroySelf = (
  originatorState: Duellist,
  monsterIdx: FieldCol
) => {
  destroyAtCoords(originatorState, [FieldRow.PlayerMonster, monsterIdx]);
};

export const specialSummon = (
  originatorState: Duellist,
  cardName: CardName,
  customProps: Partial<OccupiedMonsterZone> = {}
) => {
  try {
    const zoneIdx = getFirstEmptyZoneIdx(originatorState.monsterZones);
    originatorState.monsterZones[zoneIdx] = {
      ...generateOccupiedMonsterZone(cardName),
      ...customProps,
    };
  } catch (e) {
    return; // no free zone;
  }
};

export const magnetWarriorMergeAttempt = (
  { originatorState }: ReducerArg,
  monsterIdx: FieldCol
) => {
  const alphaIdx = getFirstMatchInRowIdx(
    originatorState.monsterZones,
    Monster.AlphaTheMagnetWarrior
  );
  const betaIdx = getFirstMatchInRowIdx(
    originatorState.monsterZones,
    Monster.BetaTheMagnetWarrior
  );
  const gammaIdx = getFirstMatchInRowIdx(
    originatorState.monsterZones,
    Monster.GammaTheMagnetWarrior
  );

  if ([alphaIdx, betaIdx, gammaIdx].includes(-1)) {
    // failed merge -- one of the required cards not present
    return;
  }

  // successful merge
  clearZones(originatorState.monsterZones, [alphaIdx, betaIdx, gammaIdx]);
  originatorState.monsterZones[monsterIdx] = {
    ...generateOccupiedMonsterZone(Monster.ValkyrionTheMagnaWarrior),
  };
};

export const resurrectOwn = (originatorState: Duellist) => {
  if (!originatorState.graveyard) return;

  specialSummon(originatorState, originatorState.graveyard as CardName);
  clearGraveyard(originatorState);
};

export const resurrectEnemy = (
  originatorState: Duellist,
  targetState: Duellist
) => {
  if (!targetState.graveyard) return;

  specialSummon(originatorState, targetState.graveyard as CardName);
  clearGraveyard(targetState);
};

export const burn = (target: Duellist, amt: number) => {
  target.lp -= amt;
};

export const heal = (target: Duellist, amt: number) => {
  target.lp += amt;
};

export const draw = (target: Duellist, numCards: number = 1) => {
  for (let i = 0; i < numCards; i++) {
    let zoneIdx: number;
    try {
      zoneIdx = getFirstEmptyZoneIdx(target.hand);
    } catch (e) {
      // no space available in hand, don't draw a card
      return;
    }

    const card = target.deck.shift();
    if (!card) {
      // TODO: player is out of cards, end game
      return;
    }

    target.hand[zoneIdx] = {
      isOccupied: true,
      card,
      orientation: Orientation.FaceDown,
    };
  }
};

export const setField = (state: Duel, field: Field) => {
  state.activeField = field;
};

export const destroyHighestAtk = (duellist: Duellist) => {
  if (!getNumCardsInRow(duellist.monsterZones)) {
    // no monsters exist, destroy nothing
    return;
  }

  const coords = [
    FieldRow.OpponentMonster,
    getHighestAtkZoneIdx(duellist.monsterZones),
  ] as FieldCoords;
  destroyAtCoords(duellist, coords);
};

export const updateMatchesInRow = (
  row: MonsterZone[],
  condition: (z: OccupiedMonsterZone) => boolean,
  effect: (z: OccupiedMonsterZone) => void
) => {
  row.forEach((z, idx, zones) => {
    if (!z.isOccupied || !condition(z)) return;
    effect(zones[idx] as OccupiedMonsterZone);
  });
};

export const subsumeMonster = (
  recipient: Duellist,
  donor: Duellist,
  recipientMonsterIdx: FieldCol,
  donorMonsterIdx: FieldCol
) => {
  const donorZone = donor.monsterZones[donorMonsterIdx] as OccupiedMonsterZone;
  recipient.monsterZones[recipientMonsterIdx] = {
    ...donorZone,
    orientation: Orientation.FaceUp,
    battlePosition: BattlePosition.Attack,
    isLocked: false,
  };
  clearZone(donor.monsterZones, donorMonsterIdx);
};

export const convertMonster = (
  originatorState: Duellist,
  targetState: Duellist
) => {
  const targetZoneIdx = getHighestAtkZoneIdx(targetState.monsterZones);
  if (targetZoneIdx === -1) return; // no monster to target
  const targetZone = targetState.monsterZones[
    targetZoneIdx
  ] as OccupiedMonsterZone;

  try {
    const originZoneIdx = getFirstEmptyZoneIdx(originatorState.monsterZones);
    originatorState.monsterZones[originZoneIdx] = {
      ...targetZone,
      battlePosition: BattlePosition.Attack,
      orientation: Orientation.FaceUp,
      isLocked: false,
    };
    clearZone(targetState.monsterZones, targetZoneIdx);
  } catch (e) {
    // no space to put new monster
  }
};

export const clearFirstTrap = (duellist: Duellist) => {
  const trapIdx = duellist.spellTrapZones.findIndex(isTrap);
  if (trapIdx === -1) return; // no traps found
  clearZone(duellist.spellTrapZones, trapIdx);
};

export const clearAllTraps = (duellist: Duellist) => {
  duellist.spellTrapZones.forEach((z, idx, zones) => {
    if (!isTrap(z)) return;
    clearZone(zones, idx);
  });
};

export const powerUpSelfConditional = (
  originatorState: Duellist,
  monsterIdx: FieldCol,
  rowConditionPairs: (
    | [Zone[], (z: Zone) => boolean]
    | [Zone[], (z: Zone) => boolean, number]
  )[],
  graveyardConditionPairs: (
    | [CardName | null, (c: MonsterCard) => boolean]
    | [CardName | null, (c: MonsterCard) => boolean, number]
  )[] = []
) => {
  let count = 0;
  rowConditionPairs.forEach(([row, condition, value = 1]) => {
    // TODO: exclude origin monster from the condition?
    count += countMatchesInRow(row, condition) * value;
  });
  graveyardConditionPairs.forEach(([gy, condition, value = 1]) => {
    if (gy && condition(getCard(gy) as MonsterCard)) {
      count += value;
    }
  });
  tempPowerUp(originatorState, monsterIdx, count);
};

export const powerDownHighestAtk = (duellist: Duellist) => {
  const targetIdx = getHighestAtkZoneIdx(duellist.monsterZones);
  if (targetIdx === -1) return; // no monster to target
  permPowerUp(duellist, targetIdx, -1);
};

export const returnCardToHand = (
  duellist: Duellist,
  [rowIdx, colIdx]: FieldCoords
) => {
  try {
    const handIdx = getFirstEmptyZoneIdx(duellist.hand);
    const row = duellist[getZoneKey(rowIdx)];
    const targetZone = row[colIdx] as OccupiedZone;
    duellist.hand[handIdx] = {
      isOccupied: true,
      card: getCard(targetZone.card.name),
      orientation: Orientation.FaceDown,
    };
    clearZone(row, colIdx);
  } catch (e) {
    // no space in hand, do nothing
  }
};

export const destroyLeftMostCard = (duellist: Duellist, row: FieldRow) => {
  // target the first card found starting from left, NOT specifically the card at idx 0
  const targetIdx = getFirstOccupiedZoneIdx(duellist[getZoneKey(row)]);
  if (targetIdx !== -1) {
    destroyAtCoords(duellist, [row, targetIdx]);
  }
  return targetIdx;
};

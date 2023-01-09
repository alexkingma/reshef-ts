import { calculateAttack } from "./combatUtil";
import { BattlePosition, Field, Monster, Orientation, RowKey } from "./common";
import {
  containsAllCards,
  countMatchesInRow,
  generateOccupiedMonsterZone,
  getCard,
  getFirstEmptyZoneIdx,
  getFirstMatchInRowIdx,
  getFirstOccupiedZoneIdx,
  getHighestAtkZoneIdx,
  getOtherDuellistKey,
  getZone,
  isMonster,
  isTrap,
} from "./duelUtil";

export const permPowerUp = (
  state: Duel,
  coords: ZoneCoords,
  levels: number = 1
) => {
  const zone = getZone(state, coords) as OccupiedMonsterZone;
  zone.permPowerUpLevel += levels;
};

export const tempPowerUp = (
  state: Duel,
  coords: ZoneCoords,
  levels: number = 1
) => {
  const zone = getZone(state, coords) as OccupiedMonsterZone;
  zone.tempPowerUpLevel += levels;
};

export const permPowerDown = (
  state: Duel,
  coords: ZoneCoords,
  levels: number = 1
) => {
  permPowerUp(state, coords, -levels);
};

export const tempPowerDown = (
  state: Duel,
  coords: ZoneCoords,
  levels: number = 1
) => {
  tempPowerUp(state, coords, -levels);
};

export const destroyRow = (state: Duel, rowCoords: RowCoords) => {
  const [dKey, rKey] = rowCoords;
  state[dKey][rKey].forEach((zone, idx) => {
    if (zone.isOccupied) {
      destroyAtCoords(state, [...rowCoords, idx as FieldCol]);
    }
  });
};

export const destroyAtCoords = (
  state: Duel,
  [dKey, rKey, colIdx]: ZoneCoords
) => {
  const zone = state[dKey][rKey][colIdx];
  if (!zone.isOccupied) return;
  if (isMonster(zone)) {
    state[dKey].graveyard = zone.card.name;
  }
  clearZone(state, [dKey, rKey, colIdx]);
};

export const clearGraveyard = (state: Duel, dKey: DuellistKey) => {
  state[dKey].graveyard = null;
};

export const clearZone = (state: Duel, [dKey, rKey, colIdx]: ZoneCoords) => {
  // does NOT send anything to graveyard
  state[dKey][rKey][colIdx] = { isOccupied: false };
};

export const clearZones = (
  state: Duel,
  rowCoords: RowCoords,
  idxs: number[]
) => {
  idxs.forEach((idx) => clearZone(state, [...rowCoords, idx] as ZoneCoords));
};

const setRowOrientation = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  orientation: Orientation
) => {
  state[dKey][rKey].forEach((zone, idx, row) => {
    if (!zone.isOccupied) return;
    (row[idx] as OccupiedZone).orientation = orientation;
  });
};

export const setRowFaceUp = (state: Duel, rowCoords: RowCoords) => {
  setRowOrientation(state, rowCoords, Orientation.FaceUp);
};

export const setRowFaceDown = (state: Duel, rowCoords: RowCoords) => {
  setRowOrientation(state, rowCoords, Orientation.FaceDown);
};

export const immobiliseCard = (state: Duel, zoneCoords: ZoneCoords) => {
  const zone = getZone(state, zoneCoords) as OccupiedMonsterZone;
  zone.isLocked = true;
};

export const immobiliseRow = (state: Duel, [dKey, rKey]: RowCoords) => {
  state[dKey][rKey].forEach((zone, idx) => {
    if (!zone.isOccupied) return;
    immobiliseCard(state, [dKey, rKey, idx as FieldCol]);
  });
};

export const directAttack = (state: Duel, attackerCoords: ZoneCoords) => {
  const targetState = state[getOtherDuellistKey(attackerCoords[0])];
  const zone = getZone(state, attackerCoords) as OccupiedMonsterZone;
  zone.orientation = Orientation.FaceUp;
  targetState.lp -= zone.card.effAtk;
};

export const attackMonster = (
  state: Duel,
  attackerCoords: ZoneCoords,
  targetCoords: ZoneCoords
) => {
  const [attackerDKey] = attackerCoords;
  const [targetDKey] = targetCoords;
  const attackerZone = getZone(state, attackerCoords) as OccupiedMonsterZone;
  const targetZone = getZone(state, targetCoords) as OccupiedMonsterZone;

  const { attackerDestroyed, targetDestroyed, attackerLpLoss, targetLpLoss } =
    calculateAttack(attackerZone, targetZone);

  if (attackerDestroyed) {
    destroyAtCoords(state, attackerCoords);
  } else {
    attackerZone.orientation = Orientation.FaceUp;
  }

  if (targetDestroyed) {
    destroyAtCoords(state, targetCoords);
  } else {
    targetZone.orientation = Orientation.FaceUp;
  }

  if (attackerLpLoss) burn(state, attackerDKey, attackerLpLoss);
  if (targetLpLoss) burn(state, targetDKey, targetLpLoss);
};

export const specialSummon = (
  state: Duel,
  dKey: DuellistKey,
  cardName: CardName,
  customProps: Partial<OccupiedMonsterZone> = {}
) => {
  try {
    const zoneIdx = getFirstEmptyZoneIdx(state, [dKey, RowKey.Monster]);
    specialSummonAtCoords(
      state,
      [dKey, RowKey.Monster, zoneIdx],
      cardName,
      customProps
    );
  } catch (e) {
    return; // no free zone;
  }
};

export const specialSummonAtCoords = (
  state: Duel,
  zoneCoords: ZoneCoords,
  cardName: CardName,
  customProps: Partial<OccupiedMonsterZone> = {}
) => {
  const zone = getZone(state, zoneCoords) as MonsterZone;
  Object.assign(zone, {
    ...generateOccupiedMonsterZone(cardName),
    ...customProps,
  });
};

export const magnetWarriorMergeAttempt = (
  state: Duel,
  zoneCoords: ZoneCoords
) => {
  const [dKey, rKey] = zoneCoords;
  const rowCoords: RowCoords = [dKey, rKey];
  const alphaIdx = getFirstMatchInRowIdx(
    state,
    rowCoords,
    Monster.AlphaTheMagnetWarrior
  );
  const betaIdx = getFirstMatchInRowIdx(
    state,
    rowCoords,
    Monster.BetaTheMagnetWarrior
  );
  const gammaIdx = getFirstMatchInRowIdx(
    state,
    rowCoords,
    Monster.GammaTheMagnetWarrior
  );

  if ([alphaIdx, betaIdx, gammaIdx].includes(-1)) {
    // failed merge -- one of the required cards not present
    return;
  }

  // successful merge
  clearZones(state, rowCoords, [alphaIdx, betaIdx, gammaIdx]);
  specialSummonAtCoords(state, zoneCoords, Monster.ValkyrionTheMagnaWarrior);
};

export const xyzMergeAttempt = (
  state: Duel,
  zoneCoords: ZoneCoords,
  mergeCombos: [inputs: Monster[], output: Monster][]
) => {
  const [dKey, rKey, colIdx] = zoneCoords;
  const rowCoords: RowCoords = [dKey, rKey];

  for (const [inputMons, outputMon] of mergeCombos) {
    if (containsAllCards(state, rowCoords, ...inputMons)) {
      const idxsToClear = [
        colIdx,
        ...inputMons.map((m) => getFirstMatchInRowIdx(state, rowCoords, m)),
      ];
      clearZones(state, rowCoords, idxsToClear);
      specialSummonAtCoords(state, zoneCoords, outputMon, { isLocked: true });
      break; // stop looking for merge combos after a match succeeds
    }
  }
};

export const resurrectOwn = (state: Duel, dKey: DuellistKey) => {
  if (!state[dKey].graveyard) return;

  specialSummon(state, dKey, state[dKey].graveyard as CardName);
  clearGraveyard(state, dKey);
};

export const resurrectEnemy = (state: Duel, originatorKey: DuellistKey) => {
  const targetKey = getOtherDuellistKey(originatorKey);
  if (!state[targetKey].graveyard) return;

  specialSummon(state, originatorKey, state[targetKey].graveyard as CardName);
  clearGraveyard(state, targetKey);
};

export const burn = (state: Duel, dKey: DuellistKey, amt: number) => {
  state[dKey].lp -= amt;
};

export const heal = (state: Duel, dKey: DuellistKey, amt: number) => {
  state[dKey].lp += amt;
};

export const draw = (state: Duel, dKey: DuellistKey, numCards: number = 1) => {
  for (let i = 0; i < numCards; i++) {
    let zoneIdx: number;
    try {
      zoneIdx = getFirstEmptyZoneIdx(state, [dKey, RowKey.Hand]);
    } catch (e) {
      // no space available in hand, don't draw a card
      return;
    }

    const card = state[dKey].deck.shift();
    if (!card) {
      // TODO: player is out of cards, end game
      return;
    }

    state[dKey].hand[zoneIdx] = {
      isOccupied: true,
      card,
      orientation: Orientation.FaceDown,
    };
  }
};

export const setField = (state: Duel, field: Field) => {
  state.activeField = field;
};

export const destroyHighestAtk = (
  state: Duel,
  dKey: DuellistKey,
  condition: (z: OccupiedZone) => boolean = () => true
) => {
  const rowCoords: RowCoords = [dKey, RowKey.Monster];
  if (!countMatchesInRow(state, rowCoords, condition)) {
    // no monsters exist, destroy nothing
    return;
  }

  const coords = [
    ...rowCoords,
    getHighestAtkZoneIdx(state, rowCoords, condition),
  ] as ZoneCoords;
  destroyAtCoords(state, coords);
};

export const destroyFirstFound = (
  state: Duel,
  rowCoords: RowCoords,
  condition: (z: OccupiedZone) => boolean = () => true
) => {
  if (!countMatchesInRow(state, rowCoords, condition)) {
    // no monsters exist, destroy nothing
    return;
  }

  const coords = [
    ...rowCoords,
    getFirstOccupiedZoneIdx(state, rowCoords, condition),
  ] as ZoneCoords;
  destroyAtCoords(state, coords);
};

export const updateMatchesInRow = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  condition: (z: OccupiedMonsterZone) => boolean,
  effect: (z: OccupiedMonsterZone) => void
) => {
  state[dKey][rKey].forEach((z, idx, zones) => {
    if (!z.isOccupied || !isMonster(z) || !condition(z)) return;
    effect(zones[idx] as OccupiedMonsterZone);
  });
};

export const subsumeMonster = (
  state: Duel,
  recipientCoords: ZoneCoords,
  donorCoords: ZoneCoords
) => {
  const [recipientDKey, recipientRKey, recipientIdx] = recipientCoords;
  const donorZone = getZone(state, donorCoords) as OccupiedMonsterZone;
  state[recipientDKey][recipientRKey][recipientIdx] = {
    ...donorZone,
    orientation: Orientation.FaceUp,
    battlePosition: BattlePosition.Attack,
    isLocked: false,
  };
  clearZone(state, donorCoords);
};

export const convertMonster = (state: Duel, originatorKey: DuellistKey) => {
  const targetKey = getOtherDuellistKey(originatorKey);
  const targetZoneIdx = getHighestAtkZoneIdx(state, [
    targetKey,
    RowKey.Monster,
  ]);
  if (targetZoneIdx === -1) return; // no monster to target
  const targetZone = state[targetKey].monsterZones[
    targetZoneIdx
  ] as OccupiedMonsterZone;

  try {
    const originZoneIdx = getFirstEmptyZoneIdx(state, [
      originatorKey,
      RowKey.Monster,
    ]);
    state[originatorKey].monsterZones[originZoneIdx] = {
      ...targetZone,
      battlePosition: BattlePosition.Attack,
      orientation: Orientation.FaceUp,
      isLocked: false,
    };
    clearZone(state, [targetKey, RowKey.Monster, targetZoneIdx]);
  } catch (e) {
    // no space to put new monster
  }
};

export const clearFirstTrap = (state: Duel, targetKey: DuellistKey) => {
  const trapIdx = state[targetKey].spellTrapZones.findIndex(isTrap);
  if (trapIdx === -1) return; // no traps found
  clearZone(state, [targetKey, RowKey.SpellTrap, trapIdx as FieldCol]);
};

export const clearAllTraps = (state: Duel, targetKey: DuellistKey) => {
  state[targetKey].spellTrapZones.forEach((z, idx) => {
    if (!isTrap(z)) return;
    clearZone(state, [targetKey, RowKey.SpellTrap, idx as FieldCol]);
  });
};

export const countConditional = (
  rowConditionPairs: (
    | [Duel, RowCoords, (z: Zone) => boolean]
    | [Duel, RowCoords, (z: Zone) => boolean, number]
  )[],
  graveyardConditionPairs: (
    | [Duel, DuellistKey, (c: MonsterCard) => boolean]
    | [Duel, DuellistKey, (c: MonsterCard) => boolean, number]
  )[] = []
) => {
  let count = 0;
  rowConditionPairs.forEach(([state, coords, condition, value = 1]) => {
    // TODO: exclude origin monster from the condition?
    count += countMatchesInRow(state, coords, condition) * value;
  });
  graveyardConditionPairs.forEach(([state, dKey, condition, value = 1]) => {
    const gy = state[dKey].graveyard;
    if (gy && condition(getCard(gy) as MonsterCard)) {
      count += value;
    }
  });
  return count;
};

export const powerUpSelfConditional = (
  state: Duel,
  coords: ZoneCoords,
  rowConditionPairs: (
    | [Duel, RowCoords, (z: Zone) => boolean]
    | [Duel, RowCoords, (z: Zone) => boolean, number]
  )[],
  graveyardConditionPairs: (
    | [Duel, DuellistKey, (c: MonsterCard) => boolean]
    | [Duel, DuellistKey, (c: MonsterCard) => boolean, number]
  )[] = []
) => {
  let count = countConditional(rowConditionPairs, graveyardConditionPairs);
  tempPowerUp(state, coords, count);
};

export const powerDownHighestAtk = (state: Duel, targetKey: DuellistKey) => {
  const targetIdx = getHighestAtkZoneIdx(state, [targetKey, RowKey.Monster]);
  if (targetIdx === -1) return; // no monster to target
  permPowerUp(state, [targetKey, RowKey.Monster, targetIdx], -1);
};

export const returnCardToHand = (state: Duel, coords: ZoneCoords) => {
  try {
    const [dKey, rKey] = coords;
    const handIdx = getFirstEmptyZoneIdx(state, [dKey, rKey]);
    const targetZone = getZone(state, coords) as OccupiedZone;
    state[dKey].hand[handIdx] = {
      isOccupied: true,
      card: getCard(targetZone.card.name),
      orientation: Orientation.FaceDown,
    };
    clearZone(state, coords);
  } catch (e) {
    // no space in hand, do nothing
  }
};

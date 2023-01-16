import {
  BattlePosition,
  CounterAttackTrap,
  CounterSpellTrap,
  Field,
  FlipEffectMonster,
  Monster,
  Orientation,
  RowKey,
} from "../common";
import { counterAttackTrapReducers } from "../reducers/counterAttackTrapReducers";
import { counterSpellTrapReducers } from "../reducers/counterSpellTrapReducers";
import { monsterFlipEffectReducers } from "../reducers/monsterFlipEffectReducers";
import { getAlignmentResult, getCard, getFieldMultiplier } from "./cardUtil";
import {
  burn,
  getDuellistCoordsMap,
  getOtherDuellistKey,
} from "./duellistUtil";
import {
  getFirstEmptyZoneIdx,
  getFirstMatchInRowIdx,
  getHighestAtkZoneIdx,
  rowContainsAllCards,
} from "./rowUtil";

export const getZone = (state: Duel, [dKey, rKey, col]: ZoneCoords) => {
  return state[dKey][rKey][col];
};

export const getOriginZone = (state: Duel) => {
  if (!state.interaction.originCoords) {
    throw Error("Origin coords not set!");
  }
  return getZone(state, state.interaction.originCoords);
};

export const isTrap = (z: Zone): z is OccupiedSpellTrapZone => {
  return z.isOccupied && z.card.category === "Trap";
};

export const isSpell = (z: Zone): z is OccupiedSpellTrapZone => {
  return z.isOccupied && z.card.category === "Magic";
};

export const isMonster = (z: Zone): z is OccupiedMonsterZone => {
  return z.isOccupied && z.card.category === "Monster";
};

export const isDefMode = (z: Zone): z is OccupiedMonsterZone => {
  return isMonster(z) && z.battlePosition === BattlePosition.Defence;
};

export const isType = (z: Zone, type: CardType): z is OccupiedMonsterZone =>
  isMonster(z) && z.card.type === type;

export const isAlignment = (
  z: Zone,
  alignment: Alignment
): z is OccupiedMonsterZone => isMonster(z) && z.card.alignment === alignment;

export const isSpecificMonster = (
  z: Zone,
  cardName: CardName
): z is OccupiedMonsterZone => isMonster(z) && z.card.name === cardName;

const isOrientation = (z: Zone, o: Orientation): z is OccupiedMonsterZone =>
  z.isOccupied && z.orientation === o;

export const isFaceDown = (z: OccupiedZone) =>
  isOrientation(z, Orientation.FaceDown);

export const isFaceUp = (z: OccupiedZone) =>
  isOrientation(z, Orientation.FaceUp);

export const hasManualEffect = (z: OccupiedMonsterZone) =>
  z.card.effect &&
  !!monsterFlipEffectReducers[z.card.name as FlipEffectMonster];

export const hasTrapCounterAttackEffect = (z: OccupiedMonsterZone) =>
  !!counterAttackTrapReducers[z.card.name as CounterAttackTrap];

export const hasTrapCounterSpellEffect = (z: OccupiedSpellTrapZone) =>
  !!counterSpellTrapReducers[z.card.name as CounterSpellTrap];

export const canActivateEffect = (z: OccupiedMonsterZone) =>
  !z.isLocked && hasManualEffect(z) && z.orientation === Orientation.FaceDown;

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

export const immobiliseCard = (state: Duel, zoneCoords: ZoneCoords) => {
  const zone = getZone(state, zoneCoords) as OccupiedMonsterZone;
  zone.isLocked = true;
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

export const calculateAttack = (
  attacker: OccupiedMonsterZone,
  target: OccupiedMonsterZone
) => {
  const isDefending = target.battlePosition === BattlePosition.Defence;
  const diff =
    attacker.card.effAtk -
    (isDefending ? target.card.effDef : target.card.effAtk);
  const { isWeak, isStrong } = getAlignmentResult(
    attacker.card.alignment,
    target.card.alignment
  );

  const attackerDestroyed =
    !isStrong && (isWeak || (diff <= 0 && !isDefending));
  const targetDestroyed =
    !isWeak && (isStrong || diff > 0 || (diff === 0 && !isDefending));
  const attackerLpLoss = targetDestroyed || diff >= 0 ? 0 : Math.abs(diff);
  const targetLpLoss = attackerDestroyed || diff <= 0 || isDefending ? 0 : diff;

  return {
    attackerDestroyed,
    targetDestroyed,
    attackerLpLoss,
    targetLpLoss,
  };
};

export const getCombatStats = (zone: OccupiedMonsterZone, field: Field) => {
  const { card, permPowerUpLevel: perm, tempPowerUpLevel: temp } = zone;
  const fieldMultiplier = getFieldMultiplier(field, card.type);
  const { atk: baseAtk, def: baseDef } = zone.card;
  const calc = (base: number) =>
    Math.max(0, base * fieldMultiplier + (perm + temp) * 500);
  return {
    effAtk: calc(baseAtk),
    effDef: calc(baseDef),
  };
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

export const setSpellTrap = (
  state: Duel,
  dKey: DuellistKey,
  cardName: CardName,
  customProps: Partial<OccupiedSpellTrapZone> = {}
) => {
  try {
    const zoneIdx = getFirstEmptyZoneIdx(state, [dKey, RowKey.SpellTrap]);
    setSpellTrapAtCoords(
      state,
      [dKey, RowKey.SpellTrap, zoneIdx],
      cardName,
      customProps
    );
  } catch (e) {
    return; // no free zone;
  }
};

export const setSpellTrapAtCoords = (
  state: Duel,
  zoneCoords: ZoneCoords,
  cardName: CardName,
  customProps: Partial<OccupiedSpellTrapZone> = {}
) => {
  const zone = getZone(state, zoneCoords) as SpellTrapZone;
  Object.assign(zone, {
    isOccupied: true,
    card: getCard(cardName),
    orientation: Orientation.FaceDown,
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
    if (rowContainsAllCards(state, rowCoords, ...inputMons)) {
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

export const generateOccupiedMonsterZone = (
  cardName: CardName
): OccupiedMonsterZone => ({
  // use this to avoid boilerplate elsewhere
  isOccupied: true,
  card: getCard(cardName) as MonsterCard,
  battlePosition: BattlePosition.Attack,
  orientation: Orientation.FaceUp,
  isLocked: false,
  permPowerUpLevel: 0,
  tempPowerUpLevel: 0,
});

export const postDirectMonsterAction = (
  state: Duel,
  zoneCoords: ZoneCoords,
  originalCardName: CardName
) => {
  // After attacking or manually activating an effect,
  // that monster should be flipped/locked, etc.

  // The exception is if the monster has destroyed/replaced itself
  // (e.g. special summoning another monster in its place).
  const zonePostAction = getZone(state, zoneCoords);
  if (!isSpecificMonster(zonePostAction, originalCardName)) return;

  zonePostAction.battlePosition = BattlePosition.Attack;
  zonePostAction.orientation = Orientation.FaceUp;
  zonePostAction.isLocked = true;
};

export const isCoordMatch = (c1: ZoneCoords, c2: ZoneCoords) => {
  return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2];
};

export const getZoneCoordsMap = (zoneCoords: ZoneCoords): ZoneCoordsMap => {
  const [dKey, , colIdx] = zoneCoords;
  return {
    zoneCoords,
    colIdx,
    ...getDuellistCoordsMap(dKey),
  };
};

export const getFinalPowerUpLevel = (zone: OccupiedMonsterZone) => {
  const { isOccupied, card, tempPowerUpLevel = 0, permPowerUpLevel = 0 } = zone;
  if (!isOccupied || card.category !== "Monster") return 0;

  return tempPowerUpLevel + permPowerUpLevel;
};

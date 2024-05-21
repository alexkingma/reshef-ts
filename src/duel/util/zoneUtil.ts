import { BattlePosition, DKey, Orientation, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { SpellTrapRitual } from "../enums/spellTrapRitual";
import { getAlignmentResult, getCard } from "./cardUtil";
import { CARD_NONE } from "./common";
import {
  burn,
  clearConvertedZoneFlag,
  getActiveEffects,
  getOtherDuellistKey,
} from "./duellistUtil";
import { getActiveField, getFieldMultiplier } from "./fieldUtil";
import { addToGraveyard } from "./graveyardUtil";
import {
  getFirstEmptyZoneIdx,
  getFirstSpecficCardIdx,
  getHighestAtkZoneIdx,
  hasEmptyZone,
  rowContainsAllCards,
} from "./rowUtil";

export const getZone = (state: Duel, [dKey, rKey, col]: ZoneCoords) => {
  return state.duellists[dKey][rKey][col];
};

export const getOriginZone = (state: Duel) => {
  if (!state.activeTurn.originCoords) {
    throw Error("Origin coords not set!");
  }
  return getZone(state, state.activeTurn.originCoords);
};

export const getTargetZone = (state: Duel) => {
  if (!state.activeTurn.targetCoords) {
    throw Error("Target coords not set!");
  }
  return getZone(state, state.activeTurn.targetCoords);
};

export const isOccupied = (z: Zone): z is OccupiedZone => {
  return z.id !== CARD_NONE;
};

export const isEmpty = (z: Zone): z is EmptyZone => {
  return z.id === CARD_NONE;
};

const isCategory = (z: Zone, c: CardCategory): z is OccupiedZone => {
  if (isEmpty(z)) return false;
  const { category } = getCard(z.id);
  return category === c;
};

export const isTrap = (z: Zone): z is OccupiedSpellTrapZone => {
  return isCategory(z, "Trap");
};

export const isSpell = (z: Zone): z is OccupiedSpellTrapZone => {
  return isCategory(z, "Magic");
};

export const isMonster = (z: Zone): z is OccupiedMonsterZone => {
  return isCategory(z, "Monster");
};

export const isDefMode = (z: Zone): z is OccupiedMonsterZone => {
  return isMonster(z) && z.battlePosition === BattlePosition.Defence;
};

export const isSpecificMonster = (
  z: Zone,
  id: Monster
): z is OccupiedMonsterZone => z.id === id;

const isOrientation = (z: Zone, o: Orientation): z is OccupiedZone =>
  isOccupied(z) && z.orientation === o;

export const isFaceDown = (z: Zone): z is OccupiedZone =>
  isOrientation(z, Orientation.FaceDown);

export const isFaceUp = (z: Zone): z is OccupiedZone =>
  isOrientation(z, Orientation.FaceUp);

export const isUnlocked = (z: Zone): z is OccupiedMonsterZone =>
  isMonster(z) && !z.isLocked;

export const isLocked = (z: Zone): z is OccupiedMonsterZone =>
  isMonster(z) && z.isLocked;

export const isMinAtk = (z: Zone, atk: number): z is OccupiedMonsterZone =>
  isMonster(z) && z.effAtk >= atk;

export const isMaxAtk = (z: Zone, atk: number): z is OccupiedMonsterZone =>
  isMonster(z) && z.effAtk < atk;

export const isGodCard = (z: Zone): z is OccupiedMonsterZone => {
  const godCards: Monster[] = [
    Monster.SliferTheSkyDragon,
    Monster.ObeliskTheTormentor,
    Monster.TheWingedDragonOfRaBattleMode,
    Monster.TheWingedDragonOfRaSphereMode,
    Monster.TheWingedDragonOfRaPhoenixMode,
  ];
  return isMonster(z) && godCards.includes(z.id);
};

export const isNotGodCard = (z: Zone) => !isGodCard(z);

export const canActivateFlipEffect = (z: OccupiedMonsterZone) =>
  !z.isLocked && z.orientation === Orientation.FaceDown;

export const setDefMode = (z: OccupiedMonsterZone) => {
  z.battlePosition = BattlePosition.Defence;
};

export const setAtkMode = (z: OccupiedMonsterZone) => {
  z.battlePosition = BattlePosition.Attack;
};

export const toggleBattlePosition = (z: OccupiedMonsterZone) => {
  if (z.battlePosition === BattlePosition.Attack) {
    setDefMode(z);
  } else {
    setAtkMode(z);
  }
};

export const immobiliseZone = (z: OccupiedMonsterZone) => {
  z.isLocked = true;
};

export const permPowerUp = (
  state: Duel,
  coords: ZoneCoords,
  atk: number,
  def: number
) => {
  const z = getZone(state, coords) as OccupiedMonsterZone;
  z.permPowerUpAtk += atk;
  z.permPowerUpDef += def;
};

export const tempPowerUp = (
  state: Duel,
  coords: ZoneCoords,
  atk: number,
  def: number
) => {
  const z = getZone(state, coords) as OccupiedMonsterZone;
  z.tempPowerUpAtk += atk;
  z.tempPowerUpDef += def;
};

export const permPowerDown = (
  state: Duel,
  coords: ZoneCoords,
  atk: number,
  def: number
) => {
  permPowerUp(state, coords, -atk, -def);
};

export const tempPowerDown = (
  state: Duel,
  coords: ZoneCoords,
  atk: number,
  def: number
) => {
  tempPowerUp(state, coords, -atk, -def);
};

export const destroyAtCoords = (
  state: Duel,
  coords: ZoneCoords,
  allowGodDestruction: boolean = false
) => {
  const z = getZone(state, coords);
  if (!allowGodDestruction && isGodCard(z)) return;
  if (isMonster(z)) {
    const [dKey] = coords;
    addToGraveyard(state, dKey, z.id);
    clearConvertedZoneFlag(state, coords);
  }
  clearZone(state, coords);
};

export const clearZone = (state: Duel, [dKey, rKey, colIdx]: ZoneCoords) => {
  // does NOT send anything to graveyard
  state.duellists[dKey][rKey][colIdx] = { id: CARD_NONE };
  clearConvertedZoneFlag(state, [dKey, rKey, colIdx]);
};

export const clearZones = (
  state: Duel,
  rowCoords: RowCoords,
  idxs: number[]
) => {
  idxs.forEach((idx) => clearZone(state, [...rowCoords, idx]));
};

export const directAttack = (state: Duel, attackerCoords: ZoneCoords) => {
  const targetDKey = getOtherDuellistKey(attackerCoords[0]);
  const z = getZone(state, attackerCoords) as OccupiedMonsterZone;
  z.orientation = Orientation.FaceUp;
  burn(state, targetDKey, z.effAtk);
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
    calculateAttack(state, attackerCoords, targetCoords);

  if (attackerDestroyed) {
    destroyAtCoords(state, attackerCoords, true);
  } else {
    attackerZone.orientation = Orientation.FaceUp;
  }

  if (targetDestroyed) {
    destroyAtCoords(state, targetCoords, true);
  } else {
    targetZone.orientation = Orientation.FaceUp;
  }

  if (attackerLpLoss) burn(state, attackerDKey, attackerLpLoss);
  if (targetLpLoss) burn(state, targetDKey, targetLpLoss);
};

export const calculateAttack = (
  state: Duel,
  attackerCoords: ZoneCoords,
  targetCoords: ZoneCoords
) => {
  const attacker = getZone(state, attackerCoords) as OccupiedMonsterZone;
  const target = getZone(state, targetCoords) as OccupiedMonsterZone;
  const attackerCard = getCard(attacker.id) as MonsterCard;
  const targetCard = getCard(target.id) as MonsterCard;
  const isDefending = target.battlePosition === BattlePosition.Defence;
  const diff = attacker.effAtk - (isDefending ? target.effDef : target.effAtk);
  const { isWeak, isStrong } = getAlignmentResult(
    attackerCard.alignment,
    targetCard.alignment
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

export const getCombatStats = (state: Duel, zoneCoords: ZoneCoords) => {
  const activeField = getActiveField(state);
  const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
  const { atk: baseAtk, def: baseDef, type } = getCard(z.id) as MonsterCard;
  const {
    permPowerUpAtk: permAtk = 0,
    permPowerUpDef: permDef = 0,
    tempPowerUpAtk: tempAtk = 0,
    tempPowerUpDef: tempDef = 0,
  } = z;
  const fieldMultiplier = getFieldMultiplier(activeField, type);

  // Math.round() isn't necessary in 99.9% of cases, but there's some weird JS
  // interaction with Aeris and Yami, where somehow 1400 * 0.7 = 979.9999999999,
  // despite the IRL answer being a clean integer (980).
  const calc = (base: number, perm: number, temp: number) =>
    Math.max(0, Math.round(base * fieldMultiplier + (perm + temp)));
  return {
    effAtk: calc(baseAtk, permAtk, tempAtk),
    effDef: calc(baseDef, permDef, tempDef),
  };
};

export const transformZone = (z: OccupiedZone, id: CardId) => {
  z.id = id;
};

export const transformMonster = (
  state: Duel,
  zoneCoords: ZoneCoords,
  id: Monster
) => {
  const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
  z.id = id;
};

export const setCardAtCoords = (
  state: Duel,
  zoneCoords: ZoneCoords,
  id: CardId,
  customProps: Partial<OccupiedZone> = {}
) => {
  const z = getZone(state, zoneCoords) as OccupiedZone;
  const props: Partial<OccupiedZone> = {
    id,
    orientation: Orientation.FaceDown,
    ...customProps,
  };
  Object.assign(z, props);
};

export const specialSummon = (
  state: Duel,
  dKey: DKey,
  id: Monster,
  customProps: Partial<OccupiedMonsterZone> = {}
) => {
  const i = getFirstEmptyZoneIdx(state, [dKey, RowKey.Monster]);
  if (i === -1) return; // no free zone
  const destCoords: ZoneCoords = [dKey, RowKey.Monster, i];
  summonAtCoords(state, destCoords, id, customProps);

  // sometimes we need to know which zone was just auto-summoned to
  return destCoords;
};

export const summonAtCoords = (
  state: Duel,
  zoneCoords: ZoneCoords,
  id: Monster,
  customProps: Partial<OccupiedMonsterZone> = {}
) => {
  // summoning a monster over the top of a BC-ed monster resets
  // the flag, so that the newly summoned monster doesn't get
  // "unconverted" come turn end and wind up in the opponent's hands
  clearConvertedZoneFlag(state, zoneCoords);

  const z = getZone(state, zoneCoords) as MonsterZone;
  const props: Partial<OccupiedMonsterZone> = {
    ...generateOccupiedMonsterZone(id),
    ...customProps,
  };
  Object.assign(z, props);
};

export const setSpellTrap = (
  state: Duel,
  dKey: DKey,
  id: SpellTrapRitual,
  customProps: Partial<OccupiedSpellTrapZone> = {}
) => {
  const zoneIdx = getFirstEmptyZoneIdx(state, [dKey, RowKey.SpellTrap]);
  if (zoneIdx === -1) return; // no free zone
  setCardAtCoords(state, [dKey, RowKey.SpellTrap, zoneIdx], id, customProps);
};

export const addCardToHand = (
  state: Duel,
  dKey: DKey,
  id: CardId,
  customProps: Partial<OccupiedZone> = {}
) => {
  const zoneIdx = getFirstEmptyZoneIdx(state, [dKey, RowKey.Hand]);
  if (zoneIdx === -1) return; // no free zone
  setCardAtCoords(state, [dKey, RowKey.SpellTrap, zoneIdx], id, customProps);
};

export const magnetWarriorMergeAttempt = (
  state: Duel,
  zoneCoords: ZoneCoords
) => {
  const [dKey, rKey] = zoneCoords;
  const rowCoords: RowCoords = [dKey, rKey];
  const alphaIdx = getFirstSpecficCardIdx(
    state,
    rowCoords,
    Monster.AlphaTheMagnetWarrior
  );
  const betaIdx = getFirstSpecficCardIdx(
    state,
    rowCoords,
    Monster.BetaTheMagnetWarrior
  );
  const gammaIdx = getFirstSpecficCardIdx(
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
  summonAtCoords(state, zoneCoords, Monster.ValkyrionTheMagnaWarrior);
};

export const xyzMergeAttempt = (
  state: Duel,
  zoneCoords: ZoneCoords,
  mergeCombos: [inputs: Monster[], output: Monster][]
) => {
  // note that x/y/z CANNOT merge with their "stage 2" counterparts
  // e.g. X cannot merge with YZ, only with individual Y and/or Z pieces
  const [dKey, rKey, colIdx] = zoneCoords;
  const rowCoords: RowCoords = [dKey, rKey];

  for (const [inputMons, outputMon] of mergeCombos) {
    if (rowContainsAllCards(state, rowCoords, ...inputMons)) {
      const idxsToClear = [
        colIdx,
        ...inputMons.map((m) => getFirstSpecficCardIdx(state, rowCoords, m)),
      ];
      clearZones(state, rowCoords, idxsToClear);
      summonAtCoords(state, zoneCoords, outputMon, { isLocked: true });
      break; // stop looking for merge combos after a match succeeds
    }
  }
};

export const subsumeMonster = (
  state: Duel,
  recipientCoords: ZoneCoords,
  donorCoords: ZoneCoords
) => {
  const donorZone = getZone(state, donorCoords) as OccupiedMonsterZone;
  const recipientZone = getZone(state, recipientCoords) as OccupiedMonsterZone;
  Object.assign(recipientZone, {
    ...donorZone,
    orientation: Orientation.FaceUp,
    battlePosition: BattlePosition.Attack,
    isLocked: false,
  });
  clearZone(state, donorCoords);
};

export const convertMonster = (state: Duel, originatorKey: DKey) => {
  // no zone to house converted target --> conversion fails
  if (!hasEmptyZone(state, [originatorKey, RowKey.Monster])) return;

  const targetKey = getOtherDuellistKey(originatorKey);
  const targetIdx = getHighestAtkZoneIdx(
    state,
    [targetKey, RowKey.Monster],
    isNotGodCard
  );
  if (targetIdx === -1) return; // no monster to target

  const targetCoords: ZoneCoords = [targetKey, RowKey.Monster, targetIdx];
  const targetZone = getZone(state, targetCoords) as OccupiedMonsterZone;

  const conversionCoords = specialSummon(state, originatorKey, targetZone.id, {
    permPowerUpAtk: targetZone.permPowerUpAtk,
    permPowerUpDef: targetZone.permPowerUpDef,
  })!;
  clearZone(state, targetCoords);

  // pass back the coords of the newly converted monster
  return conversionCoords;
};

export const convertMonsterCurrentTurn = (state: Duel, originatorKey: DKey) => {
  const controlledMonCoords = convertMonster(state, originatorKey);
  if (!controlledMonCoords) return; // conversion failed

  // converted monster must undo conversion on turn end
  const activeEffects = getActiveEffects(state, originatorKey);
  activeEffects.convertedZones.push(controlledMonCoords);
};

export const returnCardToHand = (state: Duel, coords: ZoneCoords) => {
  const [dKey, rKey] = coords;
  // no space in hand, do nothing
  if (!hasEmptyZone(state, [dKey, rKey])) return;
  const targetZone = getZone(state, coords);
  addCardToHand(state, dKey, targetZone.id);
  clearZone(state, coords);
};

export const generateOccupiedMonsterZone = (
  id: Monster
): OccupiedMonsterZone => {
  // use this to avoid boilerplate elsewhere
  const { atk, def } = getCard(id) as MonsterCard;
  return {
    id,
    battlePosition: BattlePosition.Attack,
    orientation: Orientation.FaceUp,
    isLocked: false,
    permPowerUpAtk: 0,
    permPowerUpDef: 0,
    tempPowerUpAtk: 0,
    tempPowerUpDef: 0,
    effAtk: atk,
    effDef: def,
  };
};

export const postDirectMonsterAction = (
  state: Duel,
  zoneCoords: ZoneCoords,
  originalCardId: Monster
) => {
  // After attacking or manually activating an effect,
  // that monster should be flipped/locked, etc.

  // The exception is if the monster has destroyed/replaced itself
  // (e.g. special summoning another monster in its place).
  const z = getZone(state, zoneCoords);
  if (!isSpecificMonster(z, originalCardId)) return;

  z.battlePosition = BattlePosition.Attack;
  z.orientation = Orientation.FaceUp;
  z.isLocked = true;
};

export const isCoordMatch = (c1: ZoneCoords, c2: ZoneCoords) => {
  return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2];
};

export const getFinalPowerUpLevel = (z: OccupiedMonsterZone) => {
  if (!isMonster(z)) return 0;

  // TODO: this will be unrealiable for uneven atk/def boosts
  const {
    permPowerUpAtk = 0,
    permPowerUpDef = 0,
    tempPowerUpAtk = 0,
    tempPowerUpDef = 0,
  } = z;
  const max = Math.max(
    permPowerUpAtk + tempPowerUpAtk,
    permPowerUpDef + tempPowerUpDef
  );
  return Math.round(max / 500);
};

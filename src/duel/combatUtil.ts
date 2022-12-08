import { default as alignmentMap } from "../assets/alignment.json";
import { default as fieldMultiplierMap } from "../assets/fields.json";
import { BattlePosition, Field } from "./common";

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

const getAlignmentResult = (attacker: Alignment, target: Alignment) => {
  const { strong, weak } = alignmentMap[attacker];
  return { isStrong: strong === target, isWeak: weak === target };
};

const getFieldMultiplier = (field: Field, type: CardType) => {
  const map = fieldMultiplierMap[field] as { [key in CardType]: number };
  return map[type] || 1;
};

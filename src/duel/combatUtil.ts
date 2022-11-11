import { BattlePosition } from "./common";

export const attackMonster = (
  attacker: OccupiedMonsterZone,
  target: OccupiedMonsterZone
) => {
  const diff = attacker.card.atk - target.card.atk;
  if (target.battlePosition === BattlePosition.Attack) {
    return attackAttackPosMonster(diff);
  } else {
    return attackDefencePosMonster(diff);
  }
};

const attackAttackPosMonster = (diff: number) => {
  let attackerDestroyed = false;
  let targetDestroyed = false;
  let attackerLpLoss = 0;
  let targetLpLoss = 0;

  if (diff > 0) {
    // greater ATK, target destroyed
    targetDestroyed = true;
    targetLpLoss = diff;
  } else if (diff < 0) {
    // less ATK, attacker destroyed
    attackerDestroyed = true;
    attackerLpLoss = Math.abs(diff);
  } else {
    // equal ATK, both destroyed
    attackerDestroyed = true;
    targetDestroyed = true;
  }
  return {
    attackerDestroyed,
    targetDestroyed,
    attackerLpLoss,
    targetLpLoss,
  };
};

const attackDefencePosMonster = (diff: number) => {
  let attackerDestroyed = false;
  let targetDestroyed = false;
  let attackerLpLoss = 0;
  let targetLpLoss = 0;

  if (diff > 0) {
    // greater ATK, target destroyed
    targetDestroyed = true;
  } else if (diff < 0) {
    // less ATK, neither destroyed
    attackerLpLoss = Math.abs(diff);
  } else {
    // equal ATK, neither destroyed
  }
  return {
    attackerDestroyed,
    targetDestroyed,
    attackerLpLoss,
    targetLpLoss,
  };
};

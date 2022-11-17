import { getAlignmentResult } from "../common/deck";
import { BattlePosition } from "./common";

export const attackMonster = (
  attacker: OccupiedMonsterZone,
  target: OccupiedMonsterZone
) => {
  const isDefending = target.battlePosition === BattlePosition.Defence;
  const diff =
    attacker.card.atk - (isDefending ? target.card.def : target.card.atk);
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

import { getAlignmentResult } from "../common/deck";
import { BattlePosition } from "./common";

export const attackMonster = (
  attacker: OccupiedMonsterZone,
  target: OccupiedMonsterZone
) => {
  const diff = attacker.card.atk - target.card.atk;
  const { isWeak, isStrong } = getAlignmentResult(
    attacker.card.alignment,
    target.card.alignment
  );

  const attackerDestroyed =
    !isStrong &&
    (isWeak || (diff <= 0 && target.battlePosition === BattlePosition.Attack));
  const targetDestroyed =
    !isWeak &&
    (isStrong ||
      diff > 0 ||
      (diff === 0 && target.battlePosition === BattlePosition.Attack));
  const attackerLpLoss = targetDestroyed || diff > 0 ? 0 : Math.abs(diff);
  const targetLpLoss =
    attackerDestroyed || target.battlePosition === BattlePosition.Defence
      ? 0
      : Math.max(diff, 0);

  return {
    attackerDestroyed,
    targetDestroyed,
    attackerLpLoss,
    targetLpLoss,
  };
};

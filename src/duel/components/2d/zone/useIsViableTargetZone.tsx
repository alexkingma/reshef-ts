import { DuellistKey, InteractionMode, RowKey } from "@/duel/common";
import { selectDuel, selectInteraction, selectZone } from "@/duel/duelSlice";
import { getZone } from "@/duel/util/duelUtil";
import { isValidSpellTarget } from "@/duel/util/targetedSpellUtil";
import { useAppSelector } from "@/hooks";

export const useIsViableTargetZone = (zoneCoords: ZoneCoords) => {
  const state = useAppSelector(selectDuel);
  const { originCoords, mode } = useAppSelector(selectInteraction);
  const targetZone = useAppSelector(selectZone(zoneCoords));
  const hasCard = targetZone.isOccupied;
  const [dKey, rKey] = zoneCoords;
  const isOwn = dKey === DuellistKey.Player;
  const isMonsterZone = rKey === RowKey.Monster;
  const isSpellTrap = rKey === RowKey.SpellTrap;

  // if no origin exists, no zone can be a target
  if (!originCoords) return false;

  // don't use selectZone here, because originCoords can be undefined
  // and we can't just conditionally fetch it with a hook, since React protests.
  const originZone = getZone(state, originCoords) as OccupiedZone;

  switch (mode) {
    case InteractionMode.ChoosingOwnMonster:
      // origin is own spell activation
      return (
        isOwn &&
        isMonsterZone &&
        hasCard &&
        isValidSpellTarget(originZone.card.name, targetZone.card.name)
      );
    case InteractionMode.ChoosingOwnMonsterZone:
      // origin is own monster normal summon
      return isOwn && isMonsterZone;
    case InteractionMode.ChoosingOwnSpellTrapZone:
      // origin is own spell being set
      return isOwn && isSpellTrap;
    case InteractionMode.ChoosingOpponentMonster:
      // origin is own monster attacking opponent monster
      return !isOwn && isMonsterZone && hasCard;
    default:
      return false;
  }
};

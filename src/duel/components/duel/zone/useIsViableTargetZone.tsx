import { selectDuel, selectInteraction, selectZone } from "@/duel/duelSlice";
import { InteractionMode, RowKey } from "@/duel/enums/duel";
import { isPlayer } from "@/duel/util/duellistUtil";
import { isValidSpellTarget } from "@/duel/util/targetedSpellUtil";
import { getZone, isOccupied } from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";

export const useIsViableTargetZone = (zoneCoords: ZoneCoords) => {
  const state = useAppSelector(selectDuel);
  const { originCoords, mode } = useAppSelector(selectInteraction);
  const targetZone = useAppSelector(selectZone(zoneCoords));
  const targetExists = isOccupied(targetZone);
  const [dKey, rKey] = zoneCoords;
  const isOriginOwn = isPlayer(dKey);
  const isOriginMonster = rKey === RowKey.Monster;
  const isOriginSpellTrap = rKey === RowKey.SpellTrap;

  // if no origin exists, no zone can be a target
  if (!originCoords) return false;

  // don't use selectZone here, because originCoords can be undefined
  // and we can't just conditionally fetch it with a hook, since React protests.
  const originZone = getZone(state, originCoords) as OccupiedZone;

  switch (mode) {
    case InteractionMode.ChoosingOwnMonster:
      // origin is own spell activation
      return (
        isOriginOwn &&
        isOriginMonster &&
        targetExists &&
        isValidSpellTarget(originZone.id, targetZone.id)
      );
    case InteractionMode.ChoosingOwnMonsterZone:
      // origin is own monster normal summon
      return isOriginOwn && isOriginMonster;
    case InteractionMode.ChoosingOwnSpellTrapZone:
      // origin is own spell being set
      return isOriginOwn && isOriginSpellTrap;
    case InteractionMode.ChoosingOpponentMonster:
      // origin is own monster attacking opponent monster
      return !isOriginOwn && isOriginMonster && targetExists;
    default:
      return false;
  }
};

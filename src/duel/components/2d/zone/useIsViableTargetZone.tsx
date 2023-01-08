import { DuellistKey, InteractionMode, RowKey } from "@/duel/common";
import { selectInteraction, selectZone } from "@/duel/duelSlice";
import { useAppSelector } from "@/hooks";

export const useIsViableTargetZone = (zoneCoords: ZoneCoords) => {
  const { mode } = useAppSelector(selectInteraction);

  const zone = useAppSelector(selectZone(zoneCoords));
  const hasCard = zone.isOccupied;
  const [dKey, rKey] = zoneCoords;
  const isOwn = dKey === DuellistKey.Player;
  const isMonster = rKey === RowKey.Monster;
  const isSpellTrap = rKey === RowKey.SpellTrap;

  switch (mode) {
    case InteractionMode.ChoosingOwnMonster:
      return isOwn && isMonster && hasCard;
    case InteractionMode.ChoosingOwnMonsterZone:
      return isOwn && isMonster;
    case InteractionMode.ChoosingOwnSpellTrapZone:
      return isOwn && isSpellTrap;
    case InteractionMode.ChoosingOpponentMonster:
      return !isOwn && isMonster && hasCard;
    default:
      return false;
  }
};

import { getCard } from "./cardUtil";
import { isMonster } from "./zoneUtil";

const isAlignment = (z: Zone, a: Alignment): z is OccupiedMonsterZone => {
  if (!isMonster(z)) return false;
  const { alignment } = getCard(z.id) as MonsterCard;
  return alignment === a;
};

export const isOneOfAlignments =
  (...alignments: Alignment[]) =>
  (z: Zone) =>
    alignments.some((a) => isAlignment(z, a));

const is =
  (align: Alignment) =>
  (z: Zone): z is OccupiedMonsterZone =>
    isAlignment(z, align);

export const isFiend = is("Fiend");
export const isEarth = is("Earth");
export const isForest = is("Forest");
export const isWater = is("Water");
export const isDark = is("Dark");
export const isLight = is("Light");
export const isWind = is("Wind");
export const isFire = is("Fire");
export const isDreams = is("Dreams");
export const isDivine = is("Divine");
export const isThunder = is("Thunder");

import { isMonster } from "./zoneUtil";

const isType = (z: Zone, type: CardType): z is OccupiedMonsterZone =>
  isMonster(z) && z.card.type === type;

export const isOneOfTypes =
  (...types: CardType[]) =>
  (z: Zone) =>
    types.some((t) => isType(z, t));

const is =
  (type: CardType) =>
  (z: Zone): z is OccupiedMonsterZone =>
    isType(z, type);

export const isAqua = is("Aqua");
export const isBeastWarrior = is("Beast-Warrior");
export const isBeast = is("Beast");
export const isDinosaur = is("Dinosaur");
export const isDragon = is("Dragon");
export const isFairy = is("Fairy");
export const isFiend = is("Fiend");
export const isFish = is("Fish");
export const isInsect = is("Insect");
export const isMachine = is("Machine");
export const isPlant = is("Plant");
export const isPyro = is("Pyro");
export const isReptile = is("Reptile");
export const isRock = is("Rock");
export const isSeaSerpent = is("Sea Serpent");
export const isSpellcaster = is("Spellcaster");
export const isThunder = is("Thunder");
export const isWarrior = is("Warrior");
export const isWingedBeast = is("Winged Beast");
export const isZombie = is("Zombie");

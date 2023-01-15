import { Monster, Spell } from "../common";
import { getCard } from "./cardUtil";

const targetedSpellMap: {
  [key in Spell]?: (card: MonsterCard) => boolean;
} = {
  // NOTE: These targeting rules will greatly differ from the original game's.
  // The original uses custom subject lists for many power-ups,
  // and the in-game card descriptions are often vague, confusing, or
  // just blatantly wrong.
  // I tested in a handful of cases to get the "theme" behind each card, but
  // this game has 693 monster cards and ~30 power-up cards, and there's no
  // way I'm doing that much research/data entry for a hobby project.
  // When the dissassembly project uncovers the logic, I'll gladly copy those
  // original maps across to this project.

  [Spell.AxeOfDespair]: () => {
    // TODO: custom list: "evil monsters that can hold an axe"
    return true;
  },
  [Spell.HornOfLight]: () => {
    // TODO: custom list: "good/neutral monsters who have feral characteristics"
    // works on baby dragon, winged dragon #1, etc.
    // doesn't work on ryu-kishin, bite shoes, mystical elf, feral imp, hitotsu-me giant, etc.
    return true;
  },
  [Spell.HornOfTheUnicorn]: () => {
    // TODO: custom list: "evil monsters who have feral characteristics"
    // works on ryu-kishin, feral imp, bite shoes, maneater bug
    // doesn't work on hitotsu-me giant (?)
    return true;
  },
  [Spell.ElectroWhip]: () => {
    // TODO: females
    // card says "female warrior", but warrior seems entirely irrelevant
    // also works on feral imp, hitotsu-me giant
    // doesn't work on baby dragon, pot the trick, bite shoes, ruykishin, lesser dragon, monster egg, axe raider
    // no idea what the theme is, maybe they are meant to hold the whip, maybe they are meant to be whipped themselves
    return true;
  },
  [Spell.MalevolentNuzzler]: () => {
    // TODO: custom list: females, plus most fiends and some assorted (any "evil" monster or dude)
    // works on melchid, newdoria, patrol robot, darkworld thorn, gil garth, kojikocy, wall of illusion
    // doesn't work on lesser dragon
    // i forget if it works on "good" females or not
    return true;
  },

  // -------------------------------------------------------------- //

  // tentatively finished below this point
  // some are probably still wrong, since I'm going by card descriptions

  // alignment-specific
  [Spell.BrightCastle]: ({ alignment }) => {
    return alignment === "Light";
  },
  [Spell.Salamandra]: ({ alignment }) => {
    return alignment === "Fire";
  },

  // type-specific
  [Spell.DarkEnergy]: ({ type }) => {
    // also works on dharma cannon (machine)
    return type === "Fiend"; // TODO: fiend type or align?
  },
  [Spell.VileGerms]: ({ type }) => {
    // desc says "forest plant", but that's wrong
    return type === "Plant";
  },
  [Spell.LaserCannonArmor]: ({ type }) => {
    return type === "Insect";
  },
  [Spell.InsectArmorWithLaserCannon]: ({ type }) => {
    return type === "Insect";
  },
  [Spell.ElfsLight]: ({ type }) => {
    return type === "Fairy";
  },
  [Spell.BeastFangs]: ({ type }) => {
    return type === "Beast";
  },
  [Spell.BlackPendant]: ({ type }) => {
    return type === "Spellcaster"; // TODO: or female
  },
  [Spell.SilverBowAndArrow]: ({ type }) => {
    return type === "Fairy";
  },
  [Spell.DragonTreasure]: ({ type }) => {
    return type === "Dragon";
  },
  [Spell.CyberShield]: ({}) => {
    return true; // TODO: female only
  },
  [Spell.MysticalMoon]: ({ type }) => {
    // TODO: also works on kuriboh, maybe they meant fiend as part of beast?
    return type === "Beast";
  },
  [Spell.VioletCrystal]: ({ type }) => {
    return type === "Zombie";
  },
  [Spell.BookOfSecretArts]: ({ type }) => {
    return type === "Spellcaster";
  },
  [Spell.Invigoration]: ({ type }) => {
    return ["Rock", "Thunder", "Pyro"].includes(type);
  },
  [Spell.MachineConversionFactory]: ({ type }) => {
    return type === "Machine";
  },
  [Spell.RaiseBodyHeat]: ({ type }) => {
    return type === "Dinosaur";
  },
  [Spell.FollowWind]: ({ type }) => {
    return type === "Winged Beast";
  },
  [Spell.PowerOfKaishin]: ({ type }) => {
    return ["Aqua", "Fish", "Sea Serpent"].includes(type);
  },
  [Spell.KunaiWithChain]: ({ type }) => {
    return type === "Warrior";
  },
  [Spell.WingedTrumpeter]: ({ type }) => {
    return type === "Fairy";
  },

  // monster-specific
  [Spell.CyclonLaser]: ({ name }) => {
    return name === "Gradius";
  },
  [Spell.ElegantEgotist]: ({ name }) => {
    return name === "Harpie Lady";
  },
  [Spell.MagicalLabyrinth]: ({ name }) => {
    return name === "Labyrinth Wall";
  },
  [Spell._7Completed]: ({ name }) => {
    return name === "Slot Machine";
  },
  [Spell.Metalmorph]: ({ name }) => {
    return [Monster.Zoa, Monster.JiraiGumo, Monster.RedEyesBDragon].includes(
      name as Monster
    );
  },

  // assorted
  [Spell.Megamorph]: () => {
    return true; // works on any monster
  },
  [Spell.SwordOfDarkDestruction]: ({ type, alignment }) => {
    // dark warriors
    return alignment === "Dark" && type === "Warrior";
  },
  [Spell.LegendarySword]: ({ type, alignment }) => {
    // non-dark warriors
    return type === "Warrior" && alignment !== "Dark";
  },
  [Spell.SteelShell]: ({ name }) => {
    // "has a shell" apparently applies to turtles only, no insects
    // or rats, no matter what their description says about shells
    return [
      "30,000-Year White Turtle",
      "Monsturtle",
      "Catapult Turtle",
      "Crab Turtle",
      "UFO Turtle",
    ].includes(name);
  },
};

export const spellHasTarget = (cardName: CardName) => {
  return (cardName as Spell) in targetedSpellMap;
};

export const isValidSpellTarget = (
  originSpell: CardName,
  targetMonster: CardName
) => {
  const condition = targetedSpellMap[originSpell as Spell];
  if (!condition) {
    console.log(`No spell target condition fn found for card: ${originSpell}`);
    return;
  }

  const monsterCard = getCard(targetMonster) as MonsterCard;
  return condition(monsterCard);
};

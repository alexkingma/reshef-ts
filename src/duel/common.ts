export enum BattlePosition {
  Attack = "ATTACK_POSITION",
  Defence = "DEFENCE_POSITION",
}

export enum Orientation {
  FaceDown = "FACE_DOWN",
  FaceUp = "FACE_UP",
}

export enum FieldRow {
  PlayerHand = 0,
  PlayerSpellTrap = 1,
  PlayerMonster = 2,
  OpponentMonster = 3,
  OpponentSpellTrap = 4,
  OpponentHand = 5,
}

export enum Field {
  Arena = "Arena",
  Yami = "Yami",
  Wasteland = "Wasteland",
  Mountain = "Mountain",
  Sogen = "Sogen",
  Umi = "Umi",
  Forest = "Forest",
}

export enum Spell {
  // burn
  Sparks = "Sparks",
  Hinotama = "Hinotama",
  FinalFlame = "Final Flame",
  Ookazi = "Ookazi",
  TremendousFire = "Tremendous Fire",
  RestructerRevolution = "Restructer Revolution",

  // heal
  MooyanCurry = "Mooyan Curry",
  RedMedicine = "Red Medicine",
  GoblinsSecretRemedy = "Goblin's Secret Remedy",
  SoulOfThePure = "Soul of the Pure",
  DianKetoTheCureMaster = "Dian Keto the Cure Master",

  // power-up
  LegendarySword = "Legendary Sword",
  SwordOfDarkDestruction = "Sword of Dark Destruction",
  DarkEnergy = "Dark Energy",
  AxeOfDespair = "Axe of Despair",
  LaserCannonArmor = "Laser Cannon Armor",
  InsectArmorWithLaserCannon = "Insect Armor with Laser Cannon",
  ElfsLight = "Elf's Light",
  BeastFangs = "Beast Fangs",
  SteelShell = "Steel Shell",
  VileGerms = "Vile Germs",
  BlackPendant = "Black Pendant",
  SilverBowAndArrow = "Silver Bow and Arrow",
  HornOfLight = "Horn of Light",
  HornOfTheUnicorn = "Horn of the Unicorn",
  DragonTreasure = "Dragon Treasure",
  ElectroWhip = "Electro-Whip",
  CyberShield = "Cyber Shield",
  MysticalMoon = "Mystical Moon",
  MalevolentNuzzler = "Malevolent Nuzzler",
  VioletCrystal = "Violet Crystal",
  BookOfSecretArts = "Book of Secret Arts",
  Invigoration = "Invigoration",
  MachineConversionFactory = "Machine Conversion Factory",
  RaiseBodyHeat = "Raise Body Heat",
  FollowWind = "Follow Wind",
  PowerOfKaishin = "Power of Kaishin",
  KunaiWithChain = "Kunai with Chain",
  Salamandra = "Salamandra",
  Megamorph = "Megamorph",
  WingedTrumpeter = "Winged Trumpeter",
  BrightCastle = "Bright Castle",

  // monster-specific power-up
  CyclonLaser = "Cyclon Laser",
  ElegantEgotist = "Elegant Egotist",
  MagicalLabyrinth = "Magical Labyrinth",
  Cursebreaker = "Cursebreaker",
  Metalmorph = "Metalmorph",
  _7Completed = "7 Completed",

  // power-down
  SpellbindingCircle = "Spellbinding Circle",
  ShadowSpell = "Shadow Spell",

  // field
  Forest = "Forest",
  Wasteland = "Wasteland",
  Mountain = "Mountain",
  Sogen = "Sogen",
  Umi = "Umi",
  Yami = "Yami",

  // general card destruction
  FinalDestiny = "Final Destiny",
  HeavyStorm = "Heavy Storm",
  DarkHole = "Dark Hole",
  Raigeki = "Raigeki",
  CrushCard = "Crush Card",
  HarpiesFeatherDuster = "Harpie's Feather Duster",
  BeckonToDarkness = "Beckon to Darkness",

  // type-specific destruction
  WarriorElimination = "Warrior Elimination",
  EternalRest = "Eternal Rest",
  StainStorm = "Stain Storm",
  EradicatingAerosol = "Eradicating Aerosol",
  BreathOfLight = "Breath of Light",
  EternalDrought = "Eternal Drought",
  ExileOfTheWicked = "Exile of the Wicked",
  LastDayOfWitch = "Last Day of Witch",

  // assorted
  JamBreedingMachine = "Jam Breeding Machine",
  StopDefense = "Stop Defense",
  SwordsOfRevealingLight = "Swords of Revealing Light",
  DarkPiercingLight = "Dark-Piercing Light",
  MonsterReborn = "Monster Reborn",
  GravediggerGhoul = "Gravedigger Ghoul",
  MessengerOfPeace = "Messenger of Peace",
  DarknessApproaches = "Darkness Approaches",
  BrainControl = "Brain Control",
  ChangeOfHeart = "Change of Heart",
  Multiply = "Multiply",
  PotOfGreed = "Pot of Greed",
  TheInexperiencedSpy = "The Inexperienced Spy",
}

// this will error if an enum value doesn't match a card name
Spell as { [key: string]: CardName };

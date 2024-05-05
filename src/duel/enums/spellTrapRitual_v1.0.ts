export type SpellTrapRitual = Spell | Trap | Ritual;

export enum Spell {
  // burn
  Sparks = 343,
  Hinotama = 344,
  FinalFlame = 345,
  Ookazi = 346,
  TremendousFire = 347,
  RestructerRevolution = 788,

  // heal
  MooyanCurry = 338,
  RedMedicine = 339,
  GoblinsSecretRemedy = 340,
  SoulOfThePure = 341,
  DianKetoTheCureMaster = 342,

  // power-up
  LegendarySword = 301,
  SwordOfDarkDestruction = 302,
  DarkEnergy = 303,
  AxeOfDespair = 304,
  LaserCannonArmor = 305,
  InsectArmorWithLaserCannon = 306,
  ElfsLight = 307,
  BeastFangs = 308,
  SteelShell = 309,
  VileGerms = 310,
  BlackPendant = 311,
  SilverBowAndArrow = 312,
  HornOfLight = 313,
  HornOfTheUnicorn = 314,
  DragonTreasure = 315,
  ElectroWhip = 316,
  CyberShield = 317,
  MysticalMoon = 319,
  MalevolentNuzzler = 321,
  VioletCrystal = 322,
  BookOfSecretArts = 323,
  Invigoration = 324,
  MachineConversionFactory = 325,
  RaiseBodyHeat = 326,
  FollowWind = 327,
  PowerOfKaishin = 328,
  KunaiWithChain = 651,
  Salamandra = 654,
  Megamorph = 657,
  WingedTrumpeter = 659,
  BrightCastle = 668,

  // monster-specific
  CyclonLaser = 196,
  ElegantEgotist = 318,
  MagicalLabyrinth = 652,
  Metalmorph = 658,
  _7Completed = 695,

  // power-down
  SpellbindingCircle = 349,
  ShadowSpell = 669,

  // field
  Forest = 330,
  Wasteland = 331,
  Mountain = 332,
  Sogen = 333,
  Umi = 334,
  Yami = 335,

  // general card destruction
  FinalDestiny = 193,
  HeavyStorm = 194,
  DarkHole = 336,
  Raigeki = 337,
  CrushCard = 661,
  HarpiesFeatherDuster = 672,
  BeckonToDarkness = 693,

  // type-specific destruction
  WarriorElimination = 653,
  EternalRest = 656,
  StainStorm = 660,
  EradicatingAerosol = 662,
  BreathOfLight = 663,
  EternalDrought = 664,
  ExileOfTheWicked = 786,
  LastDayOfWitch = 787,

  // assorted
  Cursebreaker = 655,
  JamBreedingMachine = 233,
  StopDefense = 320,
  SwordsOfRevealingLight = 348,
  DarkPiercingLight = 350,
  MonsterReborn = 601,
  GravediggerGhoul = 609,
  MessengerOfPeace = 699,
  DarknessApproaches = 700,
  BrainControl = 781,
  ChangeOfHeart = 784,
  Multiply = 785,
  PotOfGreed = 789,
  TheInexperiencedSpy = 790,
}

export enum Trap {
  DragonCaptureJar = 329,
  DestinyBoard = 583,
  SpiritMessageI = 584,
  SpiritMessageN = 585,
  SpiritMessageA = 586,
  SpiritMessageL = 587,
  AmazonArchers = 641,
  HouseOfAdhesiveTape = 681,
  Eatgaboon = 682,
  BearTrap = 683,
  InvisibleWire = 684,
  AcidTrapHole = 685,
  WidespreadRuin = 686,
  GoblinFan = 687,
  BadReactionToSimochi = 688,
  ReverseTrap = 689,
  FakeTrap = 690,
  TorrentialTribute = 692,
  InfiniteDismissal = 694,
  AntiRaigeki = 782,
}

export enum Ritual {
  BlackLusterRitual = 670,
  DarkMagicRitual = 722,
  BlackIllusionRitual = 783,
}

export type DirectSpell = Exclude<Spell, AutoSpellTrap>;

export type CounterSpellCard = Extract<
  Trap,
  | Trap.GoblinFan
  | Trap.BadReactionToSimochi
  | Trap.ReverseTrap
  | Trap.FakeTrap
  | Trap.AntiRaigeki
>;

export type CounterAttackCard = Extract<
  Trap,
  | Trap.AmazonArchers
  | Trap.HouseOfAdhesiveTape
  | Trap.Eatgaboon
  | Trap.BearTrap
  | Trap.InvisibleWire
  | Trap.AcidTrapHole
  | Trap.WidespreadRuin
  | Trap.TorrentialTribute
  | Trap.InfiniteDismissal
>;

export type AutoSpellTrap =
  | Extract<
      Trap,
      | Trap.DragonCaptureJar
      | Trap.DestinyBoard
      | Trap.SpiritMessageI
      | Trap.SpiritMessageN
      | Trap.SpiritMessageA
      | Trap.SpiritMessageL
    >
  | Extract<Spell, Spell.MessengerOfPeace | Spell.JamBreedingMachine>;

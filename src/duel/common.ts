export enum PlayerType {
  Human = "HUMAN",
  CPU = "CPU",
}

export enum BattlePosition {
  Attack = "ATTACK_POSITION",
  Defence = "DEFENCE_POSITION",
}

export enum Orientation {
  FaceDown = "FACE_DOWN",
  FaceUp = "FACE_UP",
}

export enum RowKey {
  Hand = "hand",
  SpellTrap = "spellTrapZones",
  Monster = "monsterZones",
  Deck = "deck",
  Graveyard = "graveyard",
  Field = "fieldZone",
}

export enum DuellistKey {
  Player = "p1",
  Opponent = "p2",
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

export enum InteractionMode {
  Locked = "LOCKED", // cursor movement not allowed (animation playing, dialogue cued, opponent's turn)
  FreeMovement = "FREE_MOVEMENT", // default state during own turn
  ViewingOptions = "VIEWING_OPTIONS", // zone buttons/actions appear (attack, summon, discard)
  ChoosingOwnMonster = "CHOOSING_OWN_MONSTER", // select a monster to target/power-up with a spell
  ChoosingOwnMonsterZone = "CHOOSING_OWN_MONSTER_ZONE", // zone to summon at (empty or otherwise)
  ChoosingOwnSpellTrapZone = "CHOOSING_OWN_SPELL_TRAP_ZONE", // zone to set at (empty or otherwise)
  ChoosingOpponentMonster = "CHOOSING_OPPONENT_MONSTER", // monster to attack (non-direct attacks)
}

export enum DuellistStatus {
  HEALTHY = "HEALTHY",
  OUT_OF_LP = "OUT_OF_LP",
  DECK_OUT = "DECK_OUT",
  SURRENDER = "SURRENDER",
  EXODIA = "EXODIA",
  DESTINY_BOARD = "DESTINY_BOARD",
}

export enum Monster {
  BlueEyesWhiteDragon = 1,
  MysticalElf = 2,
  HitotsuMeGiant = 3,
  BabyDragon = 4,
  RyuKishin = 5,
  FeralImp = 6,
  WingedDragonGuardianOfTheFortress1 = 7,
  MushroomMan = 8,
  ShadowSpecter = 9,
  BlacklandFireDragon = 10,
  SwordArmOfDragon = 11,
  SwampBattleguard = 12,
  TheSternMystic = 13,
  BattleSteer = 14,
  FlameSwordsman = 15,
  TimeWizard = 16,
  RightLegOfTheForbiddenOne = 17,
  LeftLegOfTheForbiddenOne = 18,
  RightArmOfTheForbiddenOne = 19,
  LeftArmOfTheForbiddenOne = 20,
  ExodiaTheForbiddenOne = 21,
  SummonedSkull = 22,
  TheWickedWormBeast = 23,
  SkullServant = 24,
  HornImp = 25,
  BattleOx = 26,
  BeaverWarrior = 27,
  RockOgreGrotto1 = 28,
  MountainWarrior = 29,
  ZombieWarrior = 30,
  KoumoriDragon = 31,
  TwoHeadedKingRex = 32,
  JudgeMan = 33,
  SaggiTheDarkClown = 34,
  DarkMagician = 35,
  TheSnakeHair = 36,
  GaiaTheDragonChampion = 37,
  GaiaTheFierceKnight = 38,
  CurseOfDragon = 39,
  DragonPiper = 40,
  CelticGuardian = 41,
  IllusionistFacelessMage = 42,
  KarbonalaWarrior = 43,
  RogueDoll = 44,
  OscilloHero2 = 45,
  Griffore = 46,
  Torike = 47,
  Sangan = 48,
  BigInsect = 49,
  BasicInsect = 50,
  ArmoredLizard = 51,
  HerculesBeetle = 52,
  KillerNeedle = 53,
  Gokibore = 54,
  GiantFlea = 55,
  LarvaeMoth = 56,
  GreatMoth = 57,
  Kuriboh = 58,
  MammothGraveyard = 59,
  GreatWhite = 60,
  Wolf = 61,
  HarpieLady = 62,
  HarpieLadySisters = 63,
  TigerAxe = 64,
  SilverFang = 65,
  Kojikocy = 66,
  PerfectlyUltimateGreatMoth = 67,
  Garoozis = 68,
  ThousandDragon = 69,
  FiendKraken = 70,
  Jellyfish = 71,
  CocoonOfEvolution = 72,
  KairyuShin = 73,
  GiantSoldierOfStone = 74,
  ManEatingPlant = 75,
  Krokodilus = 76,
  Grappler = 77,
  AxeRaider = 78,
  Megazowler = 79,
  Uraby = 80,
  CrawlingDragon2 = 81,
  RedEyesBDragon = 82,
  CastleOfDarkIllusions = 83,
  ReaperOfTheCards = 84,
  KingOfYamimakai = 85,
  Barox = 86,
  DarkChimera = 87,
  MetalGuardian = 88,
  CatapultTurtle = 89,
  GyakutennoMegami = 90,
  MysticHorseman = 91,
  RabidHorseman = 92,
  Zanki = 93,
  CrawlingDragon = 94,
  CrassClown = 95,
  ArmoredZombie = 96,
  DragonZombie = 97,
  ClownZombie = 98,
  PumpkingTheKingOfGhosts = 99,
  BattleWarrior = 100,
  WingsOfWickedFlame = 101,
  MaskOfDarkness = 102,
  BaronOfTheFiendSword = 103,
  CurtainOfTheDarkOnes = 104,
  Tomozaurus = 105,
  SpiritOfTheWinds = 106,
  ShiningAbyss = 107,
  HeadlessKnight = 108,
  GoddessWithTheThirdEye = 109,
  RuklambaTheSpiritKing = 110,
  DomaTheAngelOfSilence = 111,
  Keldo = 112,
  SoldierAri = 113,
  WhiteMagicalHat = 114,
  GearfriedTheIronKnight = 115,
  NightmareScorpion = 116,
  SpiritOfTheBooks = 117,
  XYZDragonCannon = 118,
  HumanoidSlime = 119,
  DreamClown = 120,
  SleepingLion = 121,
  YamatanoDragonScroll = 122,
  DarkPlant = 123,
  WormDrake = 124,
  FaithBird = 125,
  OrionTheBattleKing = 126,
  Ansatsu = 127,
  LaMoon = 128,
  Nemuriko = 129,
  WeatherControl = 130,
  Octoberser = 131,
  HumanoidWormDrake = 132,
  CharubinTheFireKnight = 133,
  RevivalJam = 134,
  FiendsHand = 135,
  WittyPhantom = 136,
  BusterBlader = 137,
  DarkNecrofear = 138,
  BlueEyedSilverZombie = 139,
  ToadMaster = 140,
  SpikedSnail = 141,
  FlameManipulator = 142,
  NecrolancerTheTimelord = 143,
  DjinnTheWatcherOfTheWind = 144,
  TheBewitchingPhantomThief = 145,
  TempleOfSkulls = 146,
  MonsterEgg = 147,
  TheShadowWhoControlsTheDark = 148,
  XHeadCannon = 149,
  Akihiron = 150,
  OrgothTheRelentless = 151,
  TheMeltingRedShadow = 152,
  DokuroizoTheGrimReaper = 153,
  FireReaper = 154,
  Larvas = 155,
  HardArmor = 156,
  Firegrass = 157,
  CyberJar = 158,
  DigBeak = 159,
  MWarrior1 = 160,
  MWarrior2 = 161,
  BanisherOfTheLight = 162,
  Lisark = 163,
  DesFeralImp = 164,
  TheJudgementHand = 165,
  MysteriousPuppeteer = 166,
  AncientJar = 167,
  DarkfireDragon = 168,
  DarkKingOfTheAbyss = 169,
  SpiritOfTheHarp = 170,
  BigEye = 171,
  Armaill = 172,
  GiantRat = 173,
  SenjuOfTheThousandHands = 174,
  UFOTurtle = 175,
  FireEye = 176,
  Monsturtle = 177,
  ClawReacher = 178,
  PhantomDewan = 179,
  Arlownay = 180,
  FlashAssailant = 181,
  KarateMan = 182,
  LuckyTrinket = 183,
  Genin = 184,
  DarkZebra = 185,
  FiendReflection2 = 186,
  GateDeeg = 187,
  GiantGerm = 188,
  Fusionist = 189,
  NimbleMomonga = 190,
  LaLaLioon = 191,
  KeyMace = 192,
  Doron = 195,
  BoarSoldier = 197,
  HappyLover = 198,
  PenguinKnight = 199,
  PetitDragon = 200,
  FrenziedPanda = 201,
  AirMarmotOfNefariousness = 202,
  PhantomGhost = 203,
  MotherGrizzly = 204,
  FlyingKamakiri1 = 205,
  TwinLongRods1 = 206,
  DrollBird = 207,
  PetitAngel = 208,
  WingedCleaver = 209,
  HinotamaSoul = 210,
  Kaminarikozou = 211,
  Meotoko = 212,
  AquaMadoor = 213,
  KagemushaOfTheBlueFlame = 214,
  FlameGhost = 215,
  NightmarePenguin = 216,
  BSkullDragon = 217,
  TwoMouthDarkruler = 218,
  Solitude = 219,
  MaskedSorcerer = 220,
  Kumootoko = 221,
  CeremonialBell = 222,
  RoaringOceanSnake = 223,
  TrapMaster = 224,
  FiendSword = 225,
  SonicBird = 226,
  MysticTomato = 227,
  WoodRemains = 228,
  HourglassOfLife = 229,
  RareFish = 230,
  WoodClown = 231,
  Kotodama = 232,
  ObeliskTheTormentor = 234,
  WodanTheResidentOfTheForest = 235,
  PerfectMachineKing = 236,
  Haniwa = 237,
  SliferTheSkyDragon = 238,
  VishwarRandi = 239,
  TheWingedDragonOfRaBattleMode = 240,
  DarkAssailant = 241,
  CandleOfFate = 242,
  WaterElement = 243,
  Dissolverock = 244,
  FlyingFish = 245,
  OneWhoHuntsSouls = 246,
  RootWater = 247,
  AmphibianBeast = 248,
  WaterOmotics = 249,
  AlligatorsSwordDragon = 250,
  EnchantingMermaid = 251,
  Nekogal1 = 252,
  RocketWarrior = 253,
  AquaSerpent = 254,
  PreventRat = 255,
  DimensionalWarrior = 256,
  TheLegendaryFisherman = 257,
  BeastkingOfTheSwamps = 258,
  SatelliteCannon = 259,
  LunarQueenElzaim = 260,
  WickedMirror = 261,
  TheLittleSwordsmanOfAile = 262,
  RockOgreGrotto2 = 263,
  WingEggElf = 264,
  TheFuriousSeaKing = 265,
  PrincessOfTsurugi = 266,
  MorphingJar2 = 267,
  VorseRaider = 268,
  VersagoTheDestroyer = 269,
  Wetha = 270,
  MegirusLight = 271,
  Mavelus = 272,
  AncientTreeOfEnlightenment = 273,
  GreenPhantomKing = 274,
  GroundAttackerBugroth = 275,
  RayTemperature = 276,
  FlameChampion = 277,
  PetitMoth = 278,
  TwinHeadedFireDragon = 279,
  DarkfireSoldier1 = 280,
  MysticClown = 281,
  MysticalSheep2 = 282,
  Holograh = 283,
  TaoTheChanter = 284,
  SerpentMarauder = 285,
  MrVolcano = 286,
  OgreOfTheBlackShadow = 287,
  DarkfireSoldier2 = 288,
  ChangeSlime = 289,
  MoonEnvoy = 290,
  Fireyarou = 291,
  Kiseitai = 292,
  MasakiTheLegendarySwordsman = 293,
  DragonessTheWickedKnight = 294,
  CyberFalcon = 295,
  OneEyedShieldDragon = 296,
  TheWingedDragonOfRaSphereMode = 297,
  WickedDragonWithTheErsatzHead = 298,
  SonicMaid = 299,
  Kurama = 300,
  Yaranzo = 351,
  KananTheSwordmistress = 352,
  Takriminos = 353,
  StuffedAnimal = 354,
  MegasonicEye = 355,
  SuperWarLion = 356,
  Yamadron = 357,
  Seiyaryu = 358,
  ThreeLeggedZombies = 359,
  ZeraTheMant = 360,
  FlyingPenguin = 361,
  MillenniumShield = 362,
  FairysGift = 363,
  BlackLusterSoldier = 364,
  FiendsMirror = 365,
  LabyrinthWall = 366,
  JiraiGumo = 367,
  ShadowGhoul = 368,
  WallShadow = 369,
  LabyrinthTank = 370,
  SangaOfTheThunder = 371,
  Kazejin = 372,
  Suijin = 373,
  GateGuardian = 374,
  DungeonWorm = 375,
  MonsterTamer = 376,
  RyuKishinPowered = 377,
  Swordstalker = 378,
  LaJinnTheMysticalGenieOfTheLamp = 379,
  BlueEyesUltimateDragon = 380,
  ToonAlligator = 381,
  RudeKaiser = 382,
  ParrotDragon = 383,
  DarkRabbit = 384,
  Bickuribox = 385,
  HarpiesPetDragon = 386,
  MysticLamp = 387,
  PendulumMachine = 388,
  GiltiaTheDKnight = 389,
  LauncherSpider = 390,
  Zoa = 391,
  Metalzoa = 392,
  ZoneEater = 393,
  SteelScorpion = 394,
  DancingElf = 395,
  Ocubeam = 396,
  Leghul = 397,
  Ooguchi = 398,
  GammaTheMagnetWarrior = 399,
  EmperorOfTheLandAndSea = 400,
  UshiOni = 401,
  MonsterEye = 402,
  Leogun = 403,
  Tatsunootoshigo = 404,
  SaberSlasher = 405,
  KaiserSeaHorse = 406,
  MachineKing = 407,
  GiantMechSoldier = 408,
  MetalDragon = 409,
  MechanicalSpider = 410,
  Bat = 411,
  TheWingedDragonOfRaPhoenixMode = 412,
  CyberSoldier = 413,
  ShovelCrusher = 414,
  Mechanicalchaser = 415,
  Blocker = 416,
  BlastJuggler = 417,
  Golgoil = 418,
  FlyingKamakiri2 = 419,
  CyberStein = 420,
  CyberCommander = 421,
  Jinzo7 = 422,
  DiceArmadillo = 423,
  SkyDragon = 424,
  ThunderDragon = 425,
  StoneD = 426,
  KaiserDragon = 427,
  MagicianOfFaith = 428,
  GoddessOfWhim = 429,
  Gradius = 430,
  IceWater = 431,
  WaterdragonFairy = 432,
  AncientElf = 433,
  HarpiesBrother = 434,
  Aeris = 435,
  WhiteDolphin = 436,
  DeepseaShark = 437,
  MetalFish = 438,
  GrandTikiElder = 439,
  _7ColoredFish = 440,
  MechBass = 441,
  AquaDragon = 442,
  SeaKingDragon = 443,
  TuruPurun = 444,
  GiantRex = 445,
  AquaSnake = 446,
  GiantRedSeasnake = 447,
  SpikeSeadra = 448,
  _30000YearWhiteTurtle = 449,
  KappaAvenger = 450,
  Kanikabuto = 451,
  Zarigun = 452,
  MillenniumGolem = 453,
  DestroyerGolem = 454,
  BarrelRock = 455,
  MinomushiWarrior = 456,
  TheMaskedBeast = 457,
  KaminariAttack = 458,
  TripwireBeast = 459,
  BoltEscargot = 460,
  BoltPenguin = 461,
  TheImmortalOfThunder = 462,
  ElectricSnake = 463,
  WingEagle = 464,
  PunishedEagle = 465,
  SkullRedBird = 466,
  CrimsonSunbird = 467,
  QueenBird = 468,
  ArmedNinja = 469,
  MagicalGhost = 470,
  SoulHunter = 471,
  TheEarlOfDemise = 472,
  VermillionSparrow = 473,
  SeaKamen = 474,
  SinisterSerpent = 475,
  Ganigumo = 476,
  Alinsection = 477,
  InsectSoldiersOfTheSky = 478,
  CockroachKnight = 479,
  KuwagataA = 480,
  Burglar = 481,
  Pragtical = 482,
  Garvas = 483,
  Ameba = 484,
  Korogashi = 485,
  BooKoo = 486,
  FlowerWolf = 487,
  RainbowFlower = 488,
  BarrelLily = 489,
  NeedleBall = 490,
  Peacock = 491,
  Hoshiningen = 492,
  MahaVailo = 493,
  RainbowMarineMermaid = 494,
  MusicianKing = 495,
  Wilmee = 496,
  YadoKaru = 497,
  Morinphen = 498,
  Boneheimer = 499,
  DragonSeeker = 500,
  ManEaterBug = 501,
  PenguinTorpedo = 502,
  TurtleRaccoon = 503,
  FlameDancer = 504,
  Prisman = 505,
  GaleDogra = 506,
  CrazyFish = 507,
  CyberSaurus = 508,
  Bracchioraidus = 509,
  LaughingFlower = 510,
  BeanSoldier = 511,
  CannonSoldier = 512,
  GuardianOfTheThroneRoom = 513,
  AsuraPriest = 514,
  TheStatueOfEasterIsland = 515,
  MukaMuka = 516,
  ZombyraTheDark = 517,
  BoulderTortoise = 518,
  FireKraken = 519,
  TurtleBird = 520,
  Skullbird = 521,
  MonstrousBird = 522,
  TheBistroButcher = 523,
  StarBoy = 524,
  SpiritOfTheMountain = 525,
  EarthboundSpirit = 526,
  MilusRadiant = 527,
  Togex = 528,
  FlameCerebrus = 529,
  EmbodimentOfApophis = 530,
  MysticalSand = 531,
  GeminiElf = 532,
  KwagarHercules = 533,
  Minar = 534,
  AncientLamp = 535,
  Mechaleon = 536,
  MegaThunderball = 537,
  Niwatori = 538,
  AmazonChainMaster = 539,
  Skelengel = 540,
  HaneHane = 541,
  Misairuzame = 542,
  ThunderNyanNyan = 543,
  DharmaCannon = 544,
  Skelgon = 545,
  WowWarrior = 546,
  Griggle = 547,
  BoneMouse = 548,
  FrogTheJam = 549,
  LastTuskMammoth = 550,
  DarkElf = 551,
  WingedDragonGuardianOfTheFortress2 = 552,
  MushroomMan2 = 553,
  LavaBattleguard = 554,
  QueensKnight = 555,
  InjectionFairyLily = 556,
  JacksKnight = 557,
  PotTheTrick = 558,
  OscilloHero = 559,
  InvaderFromAnotherDimension = 560,
  LesserDragon = 561,
  NeedleWorm = 562,
  KingsKnight = 563,
  GreatMammothOfGoldfine = 564,
  GilGarth = 565,
  Yormungarde = 566,
  DarkworldThorns = 567,
  BladeKnight = 568,
  Gernia = 569,
  Trakadon = 570,
  BDragonJungleKing = 571,
  EmpressJudge = 572,
  LittleD = 573,
  WitchOfTheBlackForest = 574,
  YDragonHead = 575,
  GiantScorpionOfTheTundra = 576,
  CrowGoblin = 577,
  DarkMagicianKnight = 578,
  AbyssFlower = 579,
  PatrolRobo = 580,
  Takuhee = 581,
  DarkWitch = 582,
  LivingVase = 588,
  TentaclePlant = 589,
  ZMetalTank = 590,
  MorphingJar = 591,
  MuseA = 592,
  XYDragonCannon = 593,
  RoseSpectreOfDunn = 594,
  FiendReflection1 = 595,
  XZTankCannon = 596,
  YZTankDragon = 597,
  LittleChimera = 598,
  ViolentRain = 599,
  ExodiaNecross = 600,
  PenguinSoldier = 602,
  FairyDragon = 603,
  Helpoemer = 604,
  LavaGolem = 605,
  Newdoria = 606,
  DarkJeroid = 607,
  ShiningFriendship = 608,
  ElectricLizard = 610,
  HirosShadowScout = 611,
  LadyOfFaith = 612,
  TwinHeadedThunderDragon = 613,
  HunterSpider = 614,
  ArmoredStarfish = 615,
  ExecutorMakyura = 616,
  MarineBeast = 617,
  WarriorOfTradition = 618,
  ByserShock = 619,
  Snakeyashi = 620,
  SuccubusKnight = 621,
  IllWitch = 622,
  ViserDes = 623,
  HighTideGyojin = 624,
  FairyOfTheFountain = 625,
  AmazonOfTheSeas = 626,
  Nekogal2 = 627,
  WitchsApprentice = 628,
  PuppetMaster = 629,
  AmazonFighter = 630,
  MaidenOfTheMoonlight = 631,
  StoneOgreGrotto = 632,
  AmazonSwordWoman = 633,
  VampireLord = 634,
  QueensDouble = 635,
  DarkPaladin = 636,
  Trent = 637,
  QueenOfAutumnLeaves = 638,
  AmphibiousBugroth = 639,
  DifferentDimensionDragon = 640,
  MysticalSheep1 = 642,
  YamataDragon = 643,
  ShinatoKingOfAHigherPlane = 644,
  DarkFlareKnight = 645,
  MirageKnight = 646,
  BerserkDragon = 647,
  MachineAttacker = 648,
  CommandAngel = 649,
  WhiptailCrow = 650,
  DesVolstgalph = 665,
  ToonDarkMagicianGirl = 666,
  GilfordTheLightning = 667,
  MysticalBeastSerket = 671,
  CyberHarpie = 673,
  LightningConger = 674,
  ExarionUniverse = 675,
  LegendaryFiend = 676,
  GadgetSoldier = 677,
  MelchidTheFourFaceBeast = 678,
  NuviaTheWicked = 679,
  MaskedBeastDesGardius = 680,
  ValkyrionTheMagnaWarrior = 691,
  DarkSage = 696,
  FGD = 697,
  MasterOfDragonSoldier = 698,
  PerformanceOfSword = 701,
  HungryBurger = 702,
  Sengenjin = 703,
  SkullGuardian = 704,
  TriHornedDragon = 705,
  SerpentNightDragon = 706,
  SkullKnight = 707,
  CosmoQueen = 708,
  Chakra = 709,
  CrabTurtle = 710,
  Mikazukinoyaiba = 711,
  MeteorDragon = 712,
  MeteorBDragon = 713,
  FirewingPegasus = 714,
  PsychoPuppet = 715,
  GarmaSword = 716,
  JavelinBeetle = 717,
  FortressWhale = 718,
  Dokurorider = 719,
  MaskOfShineDark = 720,
  MagicianOfBlackChaos = 721,
  SlotMachine = 723,
  SpaceMegatron = 724,
  RedArcheryGirl = 725,
  RyuRan = 726,
  MangaRyuRan = 727,
  ToonMermaid = 728,
  ToonSummonedSkull = 729,
  DarkEyesIllusionist = 730,
  Relinquished = 731,
  JigenBakudan = 732,
  ThousandEyesIdol = 733,
  ThousandEyesRestrict = 734,
  SteelOgreGrotto2 = 735,
  BlastSphere = 736,
  Hyozanryu = 737,
  AlphaTheMagnetWarrior = 738,
  LegionTheFiendJester = 739,
  InvitationToADarkSleep = 740,
  LordOfD = 741,
  RedEyesBlackMetalDragon = 742,
  BarrelDragon = 743,
  HannibalNecromancer = 744,
  PantherWarrior = 745,
  ThreeHeadedGeedo = 746,
  GazelleTheKingOfMythicalBeasts = 747,
  StoneStatueOfTheAztecs = 748,
  Berfomet = 749,
  ChimeraTheFlyingMythicalBeast = 750,
  GearGolemTheMovingFortress = 751,
  Jinzo = 752,
  SwordsmanOfLandstar = 753,
  CyberRaider = 754,
  TheFiendMegacyber = 755,
  ReflectBounder = 756,
  BetaTheMagnetWarrior = 757,
  BigShieldGardna = 758,
  DollOfDemise = 759,
  DarkMagicianGirl = 760,
  AlligatorsSword = 761,
  InsectQueen = 762,
  ParasiteParacide = 763,
  SkullMarkLadyBug = 764,
  TinyGuardian = 765,
  PinchHopper = 766,
  BlueEyesToonDragon = 767,
  TheUnhappyMaiden = 768,
  WallOfIllusion = 769,
  NeoTheMagicSwordsman = 770,
  ManEatingTreasureChest = 771,
  ChironTheMage = 772,
  SwordHunter = 773,
  DrillBug = 774,
  DeepseaWarrior = 775,
  BiteShoes = 776,
  Spikebot = 777,
  BeastOfGilfer = 778,
  ThePortraitsSecret = 779,
  TheGrossGhostOfFledDreams = 780,
  GateSword = 791,
  SteelFanFighter = 792,
  LeopardGirl = 793,
  TheLastWarriorFromAnotherPlanet = 794,
  DunamesDarkWitch = 795,
  GarneciaElefantis = 796,
  TotalDefenseShogun = 797,
  BeastOfTalwar = 798,
  CyberTechAlligator = 799,
  TalonsOfShurilane = 800,
}

export type GraveyardEffectMonster = Extract<
  Monster,
  | Monster.TheWingedDragonOfRaPhoenixMode
  | Monster.Helpoemer
  | Monster.Newdoria
  | Monster.VampireLord
  | Monster.DifferentDimensionDragon
  | Monster.DarkFlareKnight
>;

export type HandEffectCard = Extract<
  Monster,
  Monster.LavaGolem | Monster.ExodiaTheForbiddenOne
>;

export type FlipEffectMonster = Extract<
  Monster,
  | Monster.FlameSwordsman
  | Monster.TimeWizard
  | Monster.BattleOx
  | Monster.CurseOfDragon
  | Monster.IllusionistFacelessMage
  | Monster.KairyuShin
  | Monster.GiantSoldierOfStone
  | Monster.ReaperOfTheCards
  | Monster.CatapultTurtle
  | Monster.GyakutennoMegami
  | Monster.SpiritOfTheBooks
  | Monster.XYZDragonCannon
  | Monster.Nemuriko
  | Monster.RevivalJam
  | Monster.FiendsHand
  | Monster.DarkNecrofear
  | Monster.ToadMaster
  | Monster.XHeadCannon
  | Monster.FireReaper
  | Monster.Doron
  | Monster.TrapMaster
  | Monster.HourglassOfLife
  | Monster.ObeliskTheTormentor
  | Monster.TheWingedDragonOfRaBattleMode
  | Monster.RocketWarrior
  | Monster.BeastkingOfTheSwamps
  | Monster.FairysGift
  | Monster.MysticLamp
  | Monster.Leghul
  | Monster.GammaTheMagnetWarrior
  | Monster.MonsterEye
  | Monster.TheWingedDragonOfRaPhoenixMode
  | Monster.GoddessOfWhim
  | Monster.DragonSeeker
  | Monster.PenguinTorpedo
  | Monster.ZombyraTheDark
  | Monster.SpiritOfTheMountain
  | Monster.AncientLamp
  | Monster.Skelengel
  | Monster.KingsKnight
  | Monster.YDragonHead
  | Monster.ZMetalTank
  | Monster.XYDragonCannon
  | Monster.XZTankCannon
  | Monster.YZTankDragon
  | Monster.ElectricLizard
  | Monster.LadyOfFaith
  | Monster.ByserShock
  | Monster.PuppetMaster
  | Monster.DarkPaladin
  | Monster.Trent
  | Monster.BerserkDragon
  | Monster.DesVolstgalph
  | Monster.GilfordTheLightning
  | Monster.MysticalBeastSerket
  | Monster.ExarionUniverse
  | Monster.LegendaryFiend
  | Monster.ValkyrionTheMagnaWarrior
  | Monster.FGD
  | Monster.RedArcheryGirl
  | Monster.Relinquished
  | Monster.ThousandEyesRestrict
  | Monster.AlphaTheMagnetWarrior
  | Monster.InvitationToADarkSleep
  | Monster.BarrelDragon
  | Monster.ReflectBounder
  | Monster.BetaTheMagnetWarrior
  | Monster.ParasiteParacide
  | Monster.SkullMarkLadyBug
  | Monster.PinchHopper
  | Monster.ChironTheMage
  | Monster.BeastOfGilfer
>;

export type AutoEffectMonster = Extract<
  Monster,
  | Monster.CastleOfDarkIllusions
  | Monster.SatelliteCannon
  | Monster.ThunderNyanNyan
  | Monster.ExodiaNecross
  | Monster.LavaGolem
  | Monster.ViserDes
  | Monster.MirageKnight
  | Monster.BerserkDragon
  | Monster.Jinzo
  | Monster.PetitMoth
  | Monster.LarvaeMoth
  | Monster.CocoonOfEvolution
  | Monster.GreatMoth
>;

export type TempEffectMonster = Extract<
  Monster,
  | Monster.MysticalElf
  | Monster.HarpieLady
  | Monster.HarpieLadySisters
  | Monster.CyberHarpie
  | Monster.MonsterTamer
  | Monster.SwampBattleguard
  | Monster.MammothGraveyard
  | Monster.PumpkingTheKingOfGhosts
  | Monster.BusterBlader
  | Monster.MWarrior1
  | Monster.MWarrior2
  | Monster.NightmarePenguin
  | Monster.WodanTheResidentOfTheForest
  | Monster.PerfectMachineKing
  | Monster.SliferTheSkyDragon
  | Monster.LabyrinthTank
  | Monster.MachineKing
  | Monster.Hoshiningen
  | Monster.LavaBattleguard
  | Monster.BladeKnight
  | Monster.DarkJeroid
  | Monster.WitchsApprentice
  | Monster.CommandAngel
  | Monster.ToonDarkMagicianGirl
  | Monster.MasterOfDragonSoldier
  | Monster.DarkMagicianGirl
  | Monster.InsectQueen
>;
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

export type SpellTrapRitual = Spell | Trap | Ritual;

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

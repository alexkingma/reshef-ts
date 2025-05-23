import { Monster } from "@/duel/enums/monster";
import { Spell, Trap } from "@/duel/enums/spellTrapRitual";
import cards from "./cards";

const getCard = (id: CardId): Card => {
  const dbCard = cards[id + 1];
  if (!dbCard) {
    throw new Error(`Unknown card id: ${id}`);
  }
  return dbCard;
};

const updatedCards: Card[] = [
  // ---- stat changes ----- //
  {
    ...(getCard(Monster.DarkEyesIllusionist) as MonsterCard),
    cost: 161,
    def: 1400,
  },
  {
    ...(getCard(Monster.NightmarePenguin) as MonsterCard),
    cost: 260,
    level: 4,
    atk: 900,
    def: 1800,
  },
  {
    ...(getCard(Monster.Barox) as MonsterCard),
    cost: 9,
    atk: 1380,
    def: 1530,
  },
  {
    ...(getCard(Monster.DarkChimera) as MonsterCard),
    cost: 15,
    atk: 1610,
    def: 1460,
  },
  {
    ...(getCard(Monster.KingOfYamimakai) as MonsterCard),
    cost: 86,
    atk: 2000,
    def: 1530,
  },
  {
    ...(getCard(Monster.CastleOfDarkIllusions) as MonsterCard),
    cost: 298,
    atk: 920,
    def: 1930,
  },
  {
    ...(getCard(Monster.ReaperOfTheCards) as MonsterCard),
    cost: 68,
    atk: 1380,
    def: 1930,
  },
  {
    ...(getCard(Monster.MetalGuardian) as MonsterCard),
    cost: 132,
    atk: 1150,
    def: 2150,
  },
  {
    ...(getCard(Monster.PenguinTorpedo) as MonsterCard),
    cost: 33,
    atk: 550,
  },
  {
    ...(getCard(Monster.HannibalNecromancer) as MonsterCard),
    cost: 260,
    level: 4,
  },
  {
    ...(getCard(Monster.SliferTheSkyDragon) as MonsterCard),
    atk: 0,
    def: 0,
  },

  // ---- name changes ----- //
  {
    ...getCard(Trap.TorrentialTribute),
    name: "Mirror Force",
  },
  {
    ...getCard(Trap.InfiniteDismissal),
    name: "Negate Attack",
  },
  {
    ...getCard(Spell.StainStorm),
    name: "Acid Rain",
  },
  {
    ...getCard(Monster.Kaminarikozou),
    name: "Thunder Kid",
  },
  {
    ...getCard(Spell.BrightCastle),
    name: "Shine Palace",
  },
  {
    ...getCard(Monster.FGD),
    name: "Five-Headed Dragon",
  },
  {
    ...getCard(Monster.MasterOfDragonSoldier),
    name: "Dragon Master Knight",
  },
  {
    ...getCard(Monster.AmazonChainMaster),
    name: "Amazoness Chain Master",
  },
  {
    ...getCard(Monster.HarpiesBrother),
    name: "Sky Scout",
  },
  {
    ...getCard(Monster.OscilloHero1),
    name: "Oscillo Hero",
  },
  {
    ...getCard(Monster.OscilloHero2),
    name: "Wattkid",
  },
  {
    ...getCard(Monster.FrogTheJam),
    name: "Slime Toad",
  },
  {
    ...getCard(Monster.BeastOfGilfer),
    name: "Archfiend of Gilfer",
  },

  // ---- type changes ----- //
  {
    ...(getCard(Monster.SuperWarLion) as MonsterCard),
    alignment: "Earth",
    cost: 6,
  },
  {
    ...(getCard(Monster.ZeraTheMant) as MonsterCard),
    alignment: "Dark",
    cost: 58,
  },
  {
    ...(getCard(Monster.BlackLusterSoldier) as MonsterCard),
    alignment: "Earth",
    cost: 95,
  },
  {
    ...(getCard(Monster.FiendsMirror) as MonsterCard),
    alignment: "Dark",
    cost: 116,
  },
  {
    ...(getCard(Monster.PerformanceOfSword) as MonsterCard),
    alignment: "Earth",
    cost: 73,
  },
  {
    ...(getCard(Monster.HungryBurger) as MonsterCard),
    alignment: "Dark",
    cost: 86,
  },
  {
    ...(getCard(Monster.SkullGuardian) as MonsterCard),
    alignment: "Light",
    cost: 20,
  },
  {
    ...(getCard(Monster.Chakra) as MonsterCard),
    alignment: "Dark",
    cost: 16,
  },
  {
    ...(getCard(Monster.CrabTurtle) as MonsterCard),
    alignment: "Water",
    cost: 25,
  },
  {
    ...(getCard(Monster.GarmaSword) as MonsterCard),
    alignment: "Dark",
    cost: 25,
  },
  {
    ...(getCard(Monster.JavelinBeetle) as MonsterCard),
    alignment: "Earth",
    cost: 25,
  },
  {
    ...(getCard(Monster.FortressWhale) as MonsterCard),
    alignment: "Water",
    cost: 9,
  },
  {
    ...(getCard(Monster.Dokurorider) as MonsterCard),
    alignment: "Dark",
    cost: 61,
  },
  {
    ...(getCard(Monster.MagicianOfBlackChaos) as MonsterCard),
    alignment: "Dark",
    cost: 58,
  },
  {
    ...(getCard(Monster.Relinquished) as MonsterCard),
    alignment: "Dark",
  },
];

const removedCardIds = new Set<CardId>([
  Monster.RuklambaTheSpiritKing,
  Monster.GateSword,
  Monster.LeopardGirl,
  Monster.SpaceMegatron,
  Monster.DollOfDemise,
  Monster.PsychoPuppet,
  Monster.MaskOfShineDark,
  Monster.SoldierAri,
  Monster.LastTuskMammoth,
  Monster.SteelFanFighter,
  Monster.AquaSerpent,
  Monster.Aeris,
  Monster.CommandAngel,
  Spell.BeckonToDarkness,
  Spell.WingedTrumpeter,
  Trap.InvisibleWire,
]);

const removedEffectCardIds = new Set<CardId>([
  Monster.GoddessOfWhim,
  Monster.PumpkingTheKingOfGhosts,
  Monster.ChironTheMage,
  Monster.FlameSwordsman,
  Monster.MonsterTamer,
  Monster.FireReaper,
  Monster.HourglassOfLife,
  Monster.GyakutennoMegami,
  Monster.MagicianOfBlackChaos,
  Monster.LadyOfFaith,
  Monster.HarpieLadySisters,
  Monster.MammothGraveyard,
  Monster.IllusionistFacelessMage,
  Monster.HarpieLady,
  Monster.FairysGift,
  Monster.MWarrior1,
  Monster.MWarrior2,
  Monster.RedArcheryGirl,
  Monster.BattleOx,
  Monster.AlphaTheMagnetWarrior,
  Monster.BetaTheMagnetWarrior,
  Monster.GammaTheMagnetWarrior,
  Monster.MysticalElf,
  Monster.LabyrinthTank,
]);

const newEffectCardIds = new Set<CardId>([
  // direct attack
  Monster.FireReaper,
  Monster.Ooguchi,
  Monster.RainbowFlower,
  Monster.Jinzo7,
  Monster.QueensDouble,

  // temp powerup whole field based on type
  Monster.NightmarePenguin,
  Monster.MilusRadiant,
  Monster.StarBoy,
  Monster.LittleChimera,

  // burn/heal numbers revised
  Spell.Sparks,
  Spell.Hinotama,
  Spell.FinalFlame,
  Spell.Ookazi,
  Spell.TremendousFire,
  Spell.GoblinsSecretRemedy,
  Spell.SoulOfThePure,
  Spell.DianKetoTheCureMaster,

  Spell.MagicalLabyrinth,

  // TODO: convert this into type keys for the effect map
]);

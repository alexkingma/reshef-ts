import { Monster } from "@/duel/enums/monster";

// TODO: fill in all cards with updated effects

export type GraveyardEffectMonster = Extract<
  Monster,
  | Monster.TheWingedDragonOfRaPhoenixMode
  | Monster.Helpoemer
  | Monster.Newdoria
  | Monster.VampireLord
  | Monster.DifferentDimensionDragon
  | Monster.DarkFlareKnight
  | Monster.CockroachKnight_v1_1
  | Monster.PinchHopper_v1_1
  | Monster.Gernia_v1_1
  | Monster.SkullMarkLadyBug_v1_1
  | Monster.RevivalJam_v1_1
  | Monster.MaskedBeastDesGardius_v1_1
  | Monster.TheImmortalOfThunder_v1_1
>;

export type HandEffectCard = Extract<
  Monster,
  Monster.LavaGolem | Monster.ExodiaTheForbiddenOne
>;

export type FlipEffectMonster = Extract<
  Monster,
  // | Monster.FlameSwordsman
  | Monster.TimeWizard
  // | Monster.BattleOx
  // | Monster.CurseOfDragon
  // | Monster.IllusionistFacelessMage
  // | Monster.KairyuShin
  // | Monster.GiantSoldierOfStone
  // | Monster.ReaperOfTheCards
  | Monster.CatapultTurtle
  // | Monster.GyakutennoMegami
  | Monster.SpiritOfTheBooks
  | Monster.XYZDragonCannon
  | Monster.Nemuriko
  // | Monster.RevivalJam
  // | Monster.FiendsHand
  // | Monster.DarkNecrofear
  // | Monster.ToadMaster
  | Monster.XHeadCannon
  // | Monster.FireReaper
  | Monster.Doron
  // | Monster.TrapMaster
  // | Monster.HourglassOfLife
  | Monster.ObeliskTheTormentor
  | Monster.TheWingedDragonOfRaBattleMode
  | Monster.RocketWarrior
  // | Monster.BeastkingOfTheSwamps
  // | Monster.FairysGift
  | Monster.MysticLamp
  | Monster.Leghul
  // | Monster.GammaTheMagnetWarrior
  | Monster.MonsterEye
  | Monster.TheWingedDragonOfRaPhoenixMode
  // | Monster.GoddessOfWhim
  | Monster.DragonSeeker
  // | Monster.PenguinTorpedo
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
  // | Monster.LadyOfFaith
  | Monster.ByserShock
  // | Monster.PuppetMaster
  // | Monster.DarkPaladin
  // | Monster.Trent
  | Monster.BerserkDragon
  | Monster.DesVolstgalph
  | Monster.GilfordTheLightning
  | Monster.MysticalBeastSerket
  | Monster.ExarionUniverse
  // | Monster.LegendaryFiend
  | Monster.ValkyrionTheMagnaWarrior
  | Monster.FGD
  // | Monster.RedArcheryGirl
  // | Monster.Relinquished
  | Monster.ThousandEyesRestrict
  // | Monster.AlphaTheMagnetWarrior
  | Monster.InvitationToADarkSleep
  | Monster.BarrelDragon
  | Monster.ReflectBounder
  // | Monster.BetaTheMagnetWarrior
  | Monster.ParasiteParacide
  // | Monster.SkullMarkLadyBug
  // | Monster.PinchHopper
  // | Monster.ChironTheMage
  | Monster.BeastOfGilfer

  // NEW/CHANGED:
  | Monster.FireReaper_v1_1
  | Monster.Ooguchi_v1_1
  | Monster.RainbowFlower_v1_1
  | Monster.Jinzo7_v1_1
  | Monster.QueensDouble_v1_1
  | Monster.PenguinTorpedo_v1_1
  | Monster.Suijin_v1_1
  | Monster.Kazejin_v1_1
  | Monster.SangaOfTheThunder_v1_1
  | Monster.Berfomet_v1_1
  | Monster.NeedleBall_v1_1
  | Monster.PrincessOfTsurugi_v1_1
  | Monster.NeedleWorm_v1_1
  | Monster.BlastJuggler_v1_1
  | Monster.DarkJeroid_v1_1
  | Monster.ArmedNinja_v1_1
  | Monster.TrapMaster_v1_1
  | Monster.MorphingJar_v1_1
  | Monster.ManEaterBug_v1_1
  | Monster.HaneHane_v1_1
  | Monster.PenguinSoldier_v1_1
  | Monster.BiteShoes_v1_1
  | Monster.TheImmortalOfThunder_v1_1
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
  | Monster.GearfriedTheIronKnight_v1_1
  | Monster.DarkZebra_v1_1
  | Monster.CeremonialBell_v1_1
  | Monster.BanisherOfTheLight_v1_1
  | Monster.GiantRex_v1_1
  | Monster.CastleOfDarkIllusions_v1_1
  | Monster.LegendaryFiend_v1_1
  | Monster.TotalDefenseShogun_v1_1
  | Monster.TheWickedWormBeast_v1_1
  | Monster.TheFiendMegacyber_v1_1
>;

export type TempEffectMonster = Extract<
  Monster,
  // | Monster.MysticalElf
  // | Monster.HarpieLady
  // | Monster.HarpieLadySisters
  // | Monster.CyberHarpie
  // | Monster.MonsterTamer
  // | Monster.SwampBattleguard
  // | Monster.MammothGraveyard
  // | Monster.PumpkingTheKingOfGhosts
  // | Monster.BusterBlader
  // | Monster.MWarrior1
  // | Monster.MWarrior2
  // | Monster.NightmarePenguin
  // | Monster.WodanTheResidentOfTheForest
  // | Monster.PerfectMachineKing
  // | Monster.SliferTheSkyDragon
  // | Monster.LabyrinthTank
  // | Monster.MachineKing
  // | Monster.Hoshiningen
  // | Monster.LavaBattleguard
  // | Monster.BladeKnight
  // | Monster.DarkJeroid
  // | Monster.WitchsApprentice
  // | Monster.CommandAngel
  // | Monster.ToonDarkMagicianGirl
  | Monster.MasterOfDragonSoldier
  // | Monster.DarkMagicianGirl
  | Monster.InsectQueen
>;

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
  // | Monster.RevivalJam
  | Monster.FiendsHand
  // | Monster.DarkNecrofear
  | Monster.ToadMaster
  | Monster.XHeadCannon
  // | Monster.FireReaper
  | Monster.Doron
  // | Monster.TrapMaster
  // | Monster.HourglassOfLife
  | Monster.ObeliskTheTormentor
  | Monster.TheWingedDragonOfRaBattleMode
  | Monster.RocketWarrior
  | Monster.BeastkingOfTheSwamps
  | Monster.FairysGift
  | Monster.MysticLamp
  | Monster.Leghul
  // | Monster.GammaTheMagnetWarrior
  | Monster.MonsterEye
  | Monster.TheWingedDragonOfRaPhoenixMode
  | Monster.GoddessOfWhim
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
  | Monster.LadyOfFaith
  | Monster.ByserShock
  // | Monster.PuppetMaster
  // | Monster.DarkPaladin
  | Monster.Trent
  | Monster.BerserkDragon
  | Monster.DesVolstgalph
  | Monster.GilfordTheLightning
  | Monster.MysticalBeastSerket
  | Monster.ExarionUniverse
  // | Monster.LegendaryFiend
  | Monster.ValkyrionTheMagnaWarrior
  | Monster.FGD
  | Monster.RedArcheryGirl
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
  | Monster.ChironTheMage
  | Monster.BeastOfGilfer

  // NEW/CHANGED:
  | Monster.Jinzo7_v1_1
  // TODO: add the rest
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

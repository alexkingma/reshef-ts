import { powerUp } from "./cardEffectUtil";
import { EffectMonster } from "./common";
import { ReducerArg } from "./duelSlice";

type MonsterEffectReducers = {
  [key in EffectMonster]: (arg: ReducerArg, payload?: any) => void;
};

export const monsterEffectReducers: MonsterEffectReducers = {
  [EffectMonster.MysticalElf]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.SwampBattleguard]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.FlameSwordsman]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.TimeWizard]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.BattleOx]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.CurseOfDragon]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.IllusionistFacelessMage]: ({
    originatorState,
    targetState,
  }) => {
    // TODO
  },
  [EffectMonster.MammothGraveyard]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.HarpieLady]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.HarpieLadySisters]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.KairyuShin]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.GiantSoldierOfStone]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.CastleOfDarkIllusions]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ReaperOfTheCards]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.CatapultTurtle]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.GyakutennoMegami]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.PumpkingTheKingOfGhosts]: ({
    originatorState,
    targetState,
  }) => {
    // TODO
  },
  [EffectMonster.SpiritOfTheBooks]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.XYZDragonCannon]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.Nemuriko]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.RevivalJam]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.FiendsHand]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.BusterBlader]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.DarkNecrofear]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ToadMaster]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.XHeadCannon]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.FireReaper]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.MWarrior1]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.MWarrior2]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.Doron]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.NightmarePenguin]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.TrapMaster]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.HourglassOfLife]: ({ originatorState }) => {
    originatorState.monsterZones.forEach((_, idx, zones) => {
      powerUp(zones, idx as FieldCol);
    });
  },
  [EffectMonster.ObeliskTheTormentor]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.WodanTheResidentOfTheForest]: ({
    originatorState,
    targetState,
  }) => {
    // TODO
  },
  [EffectMonster.PerfectMachineKing]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.SliferTheSkyDragon]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.TheWingedDragonOfRaBattleMode]: ({
    originatorState,
    targetState,
  }) => {
    // TODO
  },
  [EffectMonster.RocketWarrior]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.BeastkingOfTheSwamps]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.SatelliteCannon]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.TheWingedDragonOfRaSphereMode]: ({
    originatorState,
    targetState,
  }) => {
    // TODO
  },
  [EffectMonster.FairysGift]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.BlackLusterSoldier]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.LabyrinthTank]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.MonsterTamer]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.MysticLamp]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.Leghul]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.GammaTheMagnetWarrior]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.MonsterEye]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.MachineKing]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.TheWingedDragonOfRaPhoenixMode]: ({
    originatorState,
    targetState,
  }) => {
    // TODO
  },
  [EffectMonster.GoddessOfWhim]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.Hoshiningen]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.DragonSeeker]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.PenguinTorpedo]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ZombyraTheDark]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.SpiritOfTheMountain]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.AncientLamp]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.Skelengel]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ThunderNyanNyan]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.LavaBattleguard]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.KingsKnight]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.BladeKnight]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.YDragonHead]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ZMetalTank]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.XYDragonCannon]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.XZTankCannon]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.YZTankDragon]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ExodiaNecross]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.Helpoemer]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.LavaGolem]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.Newdoria]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.DarkJeroid]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ElectricLizard]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.LadyOfFaith]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ByserShock]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ViserDes]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.WitchsApprentice]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.PuppetMaster]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.VampireLord]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.DarkPaladin]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.Trent]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.DifferentDimensionDragon]: ({
    originatorState,
    targetState,
  }) => {
    // TODO
  },
  [EffectMonster.DarkFlareKnight]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.MirageKnight]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.BerserkDragon]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.CommandAngel]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.DesVolstgalph]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ToonDarkMagicianGirl]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.GilfordTheLightning]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.MysticalBeastSerket]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.CyberHarpie]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ExarionUniverse]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.LegendaryFiend]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ValkyrionTheMagnaWarrior]: ({
    originatorState,
    targetState,
  }) => {
    // TODO
  },
  [EffectMonster.FGD]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.MasterOfDragonSoldier]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.MagicianOfBlackChaos]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.RedArcheryGirl]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.Relinquished]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ThousandEyesRestrict]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.AlphaTheMagnetWarrior]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.InvitationToADarkSleep]: ({
    originatorState,
    targetState,
  }) => {
    // TODO
  },
  [EffectMonster.BarrelDragon]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.Jinzo]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ReflectBounder]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.BetaTheMagnetWarrior]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.DarkMagicianGirl]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.InsectQueen]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ParasiteParacide]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.SkullMarkLadyBug]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.PinchHopper]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.ChironTheMage]: ({ originatorState, targetState }) => {
    // TODO
  },
  [EffectMonster.BeastOfGilfer]: ({ originatorState, targetState }) => {
    // TODO
  },
};

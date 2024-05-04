import { Field, FlipEffectMonster, Monster } from "../common";
import {
  hasEmptyMonsterZones,
  opponentHasMonster,
  opponentHasSpellTrap,
  selfHasAllSpecificMonsters,
  selfHasSpecificMonster,
  shouldUseField,
} from "./aiWrappedUtil";
import { isFire } from "./cardAlignmentUtil";
import { isDinosaur, isDragon, isInsect } from "./cardTypeUtil";
import { always } from "./common";
import { graveyardContainsCards } from "./graveyardUtil";
import { countMatchesInRow, hasEmptyZone, hasMatchInRow } from "./rowUtil";
import {
  isFaceDown,
  isFaceUp,
  isNotGodCard,
  isSpell,
  isUnlocked,
} from "./zoneUtil";

export const monsterUsageMap: CardReducerMap<FlipEffectMonster, CardCondition> =
  {
    [Monster.FlameSwordsman]: opponentHasMonster(isDinosaur),
    [Monster.TimeWizard]: selfHasSpecificMonster(
      Monster.BabyDragon,
      Monster.DarkMagician
    ),
    [Monster.BattleOx]: opponentHasMonster((z) => isFire(z) && isNotGodCard(z)),
    [Monster.CurseOfDragon]: shouldUseField(Field.Wasteland),
    [Monster.IllusionistFacelessMage]: opponentHasMonster(),
    [Monster.KairyuShin]: shouldUseField(Field.Umi),
    [Monster.GiantSoldierOfStone]: shouldUseField(Field.Arena),
    [Monster.ReaperOfTheCards]: always,
    [Monster.CatapultTurtle]: (state, { ownMonsters }) =>
      countMatchesInRow(state, ownMonsters, isUnlocked) >= 2,
    [Monster.GyakutennoMegami]: (state, { ownMonsters }) =>
      hasMatchInRow(
        state,
        ownMonsters,
        (z) => (z as OccupiedMonsterZone).card.effAtk <= 500
      ),
    [Monster.SpiritOfTheBooks]: hasEmptyMonsterZones(),
    [Monster.Nemuriko]: opponentHasMonster(),
    [Monster.RevivalJam]: hasEmptyMonsterZones(),
    [Monster.FiendsHand]: opponentHasMonster(isNotGodCard),
    [Monster.DarkNecrofear]: opponentHasMonster(isNotGodCard),
    [Monster.ToadMaster]: hasEmptyMonsterZones(),
    [Monster.FireReaper]: always,
    [Monster.Doron]: hasEmptyMonsterZones(),
    [Monster.TrapMaster]: (state, { ownSpellTrap }) =>
      hasEmptyZone(state, ownSpellTrap),
    [Monster.HourglassOfLife]: always,
    [Monster.ObeliskTheTormentor]: always,
    [Monster.TheWingedDragonOfRaBattleMode]: (state, { dKey, otherDKey }) =>
      state[dKey].lp > state[otherDKey].lp,
    [Monster.RocketWarrior]: opponentHasMonster(),
    [Monster.BeastkingOfTheSwamps]: opponentHasMonster(isNotGodCard),
    [Monster.FairysGift]: always,
    [Monster.MysticLamp]: always,
    [Monster.Leghul]: always,
    [Monster.GammaTheMagnetWarrior]: selfHasAllSpecificMonsters(
      Monster.AlphaTheMagnetWarrior,
      Monster.BetaTheMagnetWarrior
    ),
    [Monster.MonsterEye]: (state, { otherHand }) =>
      hasMatchInRow(state, otherHand, isFaceDown),
    [Monster.TheWingedDragonOfRaPhoenixMode]: (
      state,
      { dKey, otherMonsters }
    ) => state[dKey].lp > 1000 && hasMatchInRow(state, otherMonsters),
    [Monster.GoddessOfWhim]: (state, { ownHand }) =>
      hasEmptyZone(state, ownHand),
    [Monster.DragonSeeker]: opponentHasMonster(
      (z) => isDragon(z) && isNotGodCard(z)
    ),
    [Monster.PenguinTorpedo]: always,
    [Monster.ZombyraTheDark]: opponentHasMonster(isNotGodCard),
    [Monster.SpiritOfTheMountain]: shouldUseField(Field.Mountain),
    [Monster.AncientLamp]: hasEmptyMonsterZones(),
    [Monster.Skelengel]: (state, { ownHand }) => hasEmptyZone(state, ownHand),
    [Monster.KingsKnight]: selfHasSpecificMonster(Monster.QueensKnight),
    [Monster.XHeadCannon]: selfHasSpecificMonster(
      Monster.YDragonHead,
      Monster.ZMetalTank
    ),
    [Monster.YDragonHead]: selfHasSpecificMonster(
      Monster.XHeadCannon,
      Monster.ZMetalTank
    ),
    [Monster.ZMetalTank]: selfHasSpecificMonster(
      Monster.XHeadCannon,
      Monster.YDragonHead
    ),
    [Monster.XYDragonCannon]: opponentHasSpellTrap(isFaceUp),
    [Monster.XZTankCannon]: opponentHasSpellTrap(isFaceDown),
    [Monster.YZTankDragon]: opponentHasMonster(
      (z) => isFaceDown(z) && isNotGodCard(z)
    ),
    [Monster.XYZDragonCannon]: opponentHasMonster(isNotGodCard),
    [Monster.ElectricLizard]: opponentHasMonster(),
    [Monster.LadyOfFaith]: always,
    [Monster.ByserShock]: opponentHasMonster(),
    [Monster.PuppetMaster]: (state, { dKey }) =>
      graveyardContainsCards(state, dKey, Monster.Gernia) &&
      state[dKey].lp > 1000,
    [Monster.DarkPaladin]: opponentHasSpellTrap(
      (z) => isFaceDown(z) || (isFaceUp(z) && isSpell(z))
    ),
    [Monster.Trent]: shouldUseField(Field.Forest),
    [Monster.BerserkDragon]: opponentHasMonster(),
    [Monster.DesVolstgalph]: opponentHasMonster(isNotGodCard),
    [Monster.GilfordTheLightning]: opponentHasMonster(isNotGodCard),
    [Monster.MysticalBeastSerket]: opponentHasMonster(isNotGodCard),
    [Monster.ExarionUniverse]: opponentHasMonster(),
    [Monster.LegendaryFiend]: always,
    [Monster.ValkyrionTheMagnaWarrior]: hasEmptyMonsterZones(2),
    [Monster.FGD]: (state, { otherMonsters, otherSpellTrap }) =>
      hasMatchInRow(state, otherMonsters, isNotGodCard) ||
      hasMatchInRow(state, otherSpellTrap),
    [Monster.RedArcheryGirl]: opponentHasMonster(),
    [Monster.Relinquished]: opponentHasMonster(isNotGodCard),
    [Monster.ThousandEyesRestrict]: opponentHasMonster(isNotGodCard),
    [Monster.AlphaTheMagnetWarrior]: selfHasAllSpecificMonsters(
      Monster.BetaTheMagnetWarrior,
      Monster.GammaTheMagnetWarrior
    ),
    [Monster.InvitationToADarkSleep]: opponentHasMonster(),
    [Monster.BarrelDragon]: opponentHasMonster(isNotGodCard),
    [Monster.ReflectBounder]: opponentHasMonster(),
    [Monster.BetaTheMagnetWarrior]: selfHasAllSpecificMonsters(
      Monster.AlphaTheMagnetWarrior,
      Monster.GammaTheMagnetWarrior
    ),
    [Monster.ParasiteParacide]: opponentHasMonster(isNotGodCard),
    [Monster.SkullMarkLadyBug]: always,
    [Monster.PinchHopper]: (state, { ownHand }) =>
      hasMatchInRow(state, ownHand, isInsect),
    [Monster.ChironTheMage]: opponentHasMonster(isNotGodCard),
    [Monster.BeastOfGilfer]: opponentHasMonster(),
  };

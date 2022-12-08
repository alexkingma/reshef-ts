import {
  burn as burnDirect,
  clearGraveyard,
  convertMonster,
  resurrectEnemy,
  setRowFaceDown,
  setRowFaceUp,
} from "./cardEffectUtil";
import {
  burn,
  destroy1500PlusAtk,
  destroyHighestAtk,
  destroyMonsterType,
  destroyRows,
  draw,
  heal,
  permPowerUp,
  setField,
} from "./cardEffectWrapped";
import {
  BattlePosition,
  DuellistKey,
  Field,
  Monster,
  RowKey,
  Spell,
} from "./common";
import { ReducerArg } from "./duelSlice";
import {
  containsCard,
  generateOccupiedMonsterZone,
  getFirstEmptyZoneIdx,
  getNumCardsInRow,
} from "./duelUtil";

type SpellEffectReducers = {
  [key in Spell]: (arg: ReducerArg, payload?: any) => void;
};

export const spellEffectReducers: SpellEffectReducers = {
  // burn
  [Spell.Sparks]: burn(50),
  [Spell.Hinotama]: burn(100),
  [Spell.FinalFlame]: burn(200),
  [Spell.Ookazi]: burn(500),
  [Spell.TremendousFire]: burn(1000),
  [Spell.RestructerRevolution]: ({ targetState }) =>
    burnDirect(targetState, getNumCardsInRow(targetState.hand) * 200),

  // heal
  [Spell.MooyanCurry]: heal(200),
  [Spell.RedMedicine]: heal(500),
  [Spell.GoblinsSecretRemedy]: heal(1000),
  [Spell.SoulOfThePure]: heal(2000),
  [Spell.DianKetoTheCureMaster]: heal(5000),

  // power-up
  [Spell.LegendarySword]: permPowerUp(),
  [Spell.SwordOfDarkDestruction]: permPowerUp(),
  [Spell.DarkEnergy]: permPowerUp(),
  [Spell.AxeOfDespair]: permPowerUp(),
  [Spell.LaserCannonArmor]: permPowerUp(),
  [Spell.InsectArmorWithLaserCannon]: permPowerUp(),
  [Spell.ElfsLight]: permPowerUp(),
  [Spell.BeastFangs]: permPowerUp(),
  [Spell.SteelShell]: permPowerUp(),
  [Spell.VileGerms]: permPowerUp(),
  [Spell.BlackPendant]: permPowerUp(),
  [Spell.SilverBowAndArrow]: permPowerUp(),
  [Spell.HornOfLight]: permPowerUp(),
  [Spell.HornOfTheUnicorn]: permPowerUp(),
  [Spell.DragonTreasure]: permPowerUp(),
  [Spell.ElectroWhip]: permPowerUp(),
  [Spell.CyberShield]: permPowerUp(),
  [Spell.MysticalMoon]: permPowerUp(),
  [Spell.MalevolentNuzzler]: permPowerUp(),
  [Spell.VioletCrystal]: permPowerUp(),
  [Spell.BookOfSecretArts]: permPowerUp(),
  [Spell.Invigoration]: permPowerUp(),
  [Spell.MachineConversionFactory]: permPowerUp(),
  [Spell.RaiseBodyHeat]: permPowerUp(),
  [Spell.FollowWind]: permPowerUp(),
  [Spell.PowerOfKaishin]: permPowerUp(),
  [Spell.KunaiWithChain]: permPowerUp(),
  [Spell.Salamandra]: permPowerUp(),
  [Spell.Megamorph]: permPowerUp(2),
  [Spell.WingedTrumpeter]: permPowerUp(),
  [Spell.BrightCastle]: permPowerUp(),

  // monster-specific power-up
  [Spell.CyclonLaser]: permPowerUp(),
  [Spell.ElegantEgotist]: permPowerUp(),
  [Spell.MagicalLabyrinth]: permPowerUp(),
  [Spell.Cursebreaker]: permPowerUp(),
  [Spell.Metalmorph]: permPowerUp(),
  [Spell._7Completed]: permPowerUp(),

  // power-down
  [Spell.SpellbindingCircle]: permPowerUp(-1),
  [Spell.ShadowSpell]: permPowerUp(-2),

  // field
  [Spell.Forest]: setField(Field.Forest),
  [Spell.Wasteland]: setField(Field.Wasteland),
  [Spell.Mountain]: setField(Field.Mountain),
  [Spell.Sogen]: setField(Field.Sogen),
  [Spell.Umi]: setField(Field.Umi),
  [Spell.Yami]: setField(Field.Yami),

  // card destruction
  [Spell.FinalDestiny]: destroyRows([
    [DuellistKey.Player, RowKey.Hand],
    [DuellistKey.Player, RowKey.SpellTrap],
    [DuellistKey.Player, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.SpellTrap],
    [DuellistKey.Opponent, RowKey.Hand],
  ]),
  [Spell.HeavyStorm]: destroyRows([
    [DuellistKey.Player, RowKey.SpellTrap],
    [DuellistKey.Player, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.SpellTrap],
  ]),
  [Spell.DarkHole]: destroyRows([
    [DuellistKey.Player, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.Monster],
  ]),
  [Spell.Raigeki]: destroyRows([[DuellistKey.Opponent, RowKey.Monster]]),
  [Spell.CrushCard]: destroy1500PlusAtk(),
  [Spell.HarpiesFeatherDuster]: destroyRows([
    [DuellistKey.Opponent, RowKey.SpellTrap],
  ]),
  [Spell.BeckonToDarkness]: destroyHighestAtk(),

  // type-specific destruction
  [Spell.WarriorElimination]: destroyMonsterType("Warrior"),
  [Spell.EternalRest]: destroyMonsterType("Zombie"),
  [Spell.StainStorm]: destroyMonsterType("Machine"),
  [Spell.EradicatingAerosol]: destroyMonsterType("Insect"),
  [Spell.BreathOfLight]: destroyMonsterType("Rock"),
  [Spell.EternalDrought]: destroyMonsterType("Fish"),
  [Spell.ExileOfTheWicked]: destroyMonsterType("Fiend"),
  [Spell.LastDayOfWitch]: destroyMonsterType("Spellcaster"),

  // assorted
  [Spell.JamBreedingMachine]: ({ originatorState, activeTurn }) => {
    try {
      const zoneIdx = getFirstEmptyZoneIdx(originatorState.monsterZones);
      originatorState.monsterZones[zoneIdx] = {
        ...generateOccupiedMonsterZone(Monster.ChangeSlime),
        isLocked: true,
      };
      activeTurn.hasNormalSummoned = true;
    } catch (e) {
      // no free zone to summon monster
    }
  },
  [Spell.StopDefense]: ({ targetState }) => {
    targetState.monsterZones.forEach((zone, idx, row) => {
      if (!zone.isOccupied) return;
      (row[idx] as OccupiedMonsterZone).battlePosition = BattlePosition.Attack;
    });
  },
  [Spell.SwordsOfRevealingLight]: ({ targetState }) => {
    // TODO
  },
  [Spell.DarkPiercingLight]: ({ targetState }) => {
    setRowFaceUp(targetState.monsterZones);
  },
  [Spell.MonsterReborn]: ({ originatorState, targetState }) => {
    resurrectEnemy(originatorState, targetState);
  },
  [Spell.GravediggerGhoul]: ({ originatorState, targetState }) => {
    clearGraveyard(originatorState);
    clearGraveyard(targetState);
  },
  [Spell.MessengerOfPeace]: ({ originatorState, targetState }) => {
    // TODO
    // perpetual activation as long as 1500+ monster is out, remains face up permanently
    // basically like DCJ
  },
  [Spell.DarknessApproaches]: ({ originatorState }) => {
    setRowFaceDown(originatorState.monsterZones);
  },
  [Spell.BrainControl]: ({ originatorState, targetState }) => {
    convertMonster(originatorState, targetState);
    // TODO: make the converted monster revert back after turn end
  },
  [Spell.ChangeOfHeart]: ({ originatorState, targetState }) => {
    convertMonster(originatorState, targetState);
  },
  [Spell.Multiply]: ({ originatorState }) => {
    if (!containsCard(originatorState.monsterZones, Monster.Kuriboh)) return;

    originatorState.monsterZones.forEach((zone, idx, row) => {
      if (zone.isOccupied) return;
      row[idx] = {
        ...generateOccupiedMonsterZone(Monster.Kuriboh),
        isLocked: true,
      };
    });
  },
  [Spell.PotOfGreed]: draw(2),
  [Spell.TheInexperiencedSpy]: ({ targetState }) => {
    setRowFaceUp(targetState.hand);
  },
};

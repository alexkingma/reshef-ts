import {
  burn as burnDirect,
  clearGraveyard,
  convertMonster,
  resurrectEnemy,
  setRowFaceDown,
  setRowFaceUp,
} from "./cardEffectUtil";
import {
  burnOther,
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
import { StateMap, ZoneCoordsMap } from "./duelSlice";
import {
  containsCard,
  countMatchesInRow,
  generateOccupiedMonsterZone,
  getFirstEmptyZoneIdx,
} from "./duelUtil";

type SpellEffectReducers = {
  [key in Spell]: (stateMap: StateMap, coordsMap: ZoneCoordsMap) => void;
};

export const spellEffectReducers: SpellEffectReducers = {
  // burn
  [Spell.Sparks]: burnOther(50),
  [Spell.Hinotama]: burnOther(100),
  [Spell.FinalFlame]: burnOther(200),
  [Spell.Ookazi]: burnOther(500),
  [Spell.TremendousFire]: burnOther(1000),
  [Spell.RestructerRevolution]: ({ state }, { otherDKey, otherHand }) =>
    burnDirect(state, otherDKey, countMatchesInRow(state, otherHand) * 200),

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
  [Spell.JamBreedingMachine]: (
    { state, originatorState, activeTurn },
    { ownMonsters }
  ) => {
    try {
      const zoneIdx = getFirstEmptyZoneIdx(state, ownMonsters);
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
  [Spell.DarkPiercingLight]: ({ state }, { otherMonsters }) => {
    setRowFaceUp(state, otherMonsters);
  },
  [Spell.MonsterReborn]: ({ state }, { dKey }) => {
    resurrectEnemy(state, dKey);
  },
  [Spell.GravediggerGhoul]: ({ state }, { dKey, otherDKey }) => {
    clearGraveyard(state, dKey);
    clearGraveyard(state, otherDKey);
  },
  [Spell.MessengerOfPeace]: ({ originatorState, targetState }) => {
    // TODO
    // perpetual activation as long as 1500+ monster is out, remains face up permanently
    // basically like DCJ
  },
  [Spell.DarknessApproaches]: ({ state }, { ownMonsters }) => {
    setRowFaceDown(state, ownMonsters);
  },
  [Spell.BrainControl]: ({ state }, { dKey }) => {
    convertMonster(state, dKey);
    // TODO: make the converted monster revert back after turn end
  },
  [Spell.ChangeOfHeart]: ({ state }, { dKey }) => {
    convertMonster(state, dKey);
  },
  [Spell.Multiply]: ({ state, originatorState }, { ownMonsters }) => {
    if (!containsCard(state, ownMonsters, Monster.Kuriboh)) return;

    originatorState.monsterZones.forEach((zone, idx, row) => {
      if (zone.isOccupied) return;
      row[idx] = {
        ...generateOccupiedMonsterZone(Monster.Kuriboh),
        isLocked: true,
      };
    });
  },
  [Spell.PotOfGreed]: draw(2),
  [Spell.TheInexperiencedSpy]: ({ state }, { otherHand }) => {
    setRowFaceUp(state, otherHand);
  },
};

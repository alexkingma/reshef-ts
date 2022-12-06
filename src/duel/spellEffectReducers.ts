import { getCard } from "../common/card";
import {
  clearGraveyard,
  clearZone,
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
  powerUp,
  setField,
} from "./cardEffectWrapped";
import { BattlePosition, Field, FieldRow, Orientation, Spell } from "./common";
import { ReducerArg } from "./duelSlice";
import {
  containsCard,
  generateOccupiedMonsterZone,
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
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
  [Spell.RestructerRevolution]: (arg) =>
    burn(getNumCardsInRow(arg.targetState.hand) * 200)(arg),

  // heal
  [Spell.MooyanCurry]: heal(200),
  [Spell.RedMedicine]: heal(500),
  [Spell.GoblinsSecretRemedy]: heal(1000),
  [Spell.SoulOfThePure]: heal(2000),
  [Spell.DianKetoTheCureMaster]: heal(5000),

  // power-up
  [Spell.LegendarySword]: powerUp(),
  [Spell.SwordOfDarkDestruction]: powerUp(),
  [Spell.DarkEnergy]: powerUp(),
  [Spell.AxeOfDespair]: powerUp(),
  [Spell.LaserCannonArmor]: powerUp(),
  [Spell.InsectArmorWithLaserCannon]: powerUp(),
  [Spell.ElfsLight]: powerUp(),
  [Spell.BeastFangs]: powerUp(),
  [Spell.SteelShell]: powerUp(),
  [Spell.VileGerms]: powerUp(),
  [Spell.BlackPendant]: powerUp(),
  [Spell.SilverBowAndArrow]: powerUp(),
  [Spell.HornOfLight]: powerUp(),
  [Spell.HornOfTheUnicorn]: powerUp(),
  [Spell.DragonTreasure]: powerUp(),
  [Spell.ElectroWhip]: powerUp(),
  [Spell.CyberShield]: powerUp(),
  [Spell.MysticalMoon]: powerUp(),
  [Spell.MalevolentNuzzler]: powerUp(),
  [Spell.VioletCrystal]: powerUp(),
  [Spell.BookOfSecretArts]: powerUp(),
  [Spell.Invigoration]: powerUp(),
  [Spell.MachineConversionFactory]: powerUp(),
  [Spell.RaiseBodyHeat]: powerUp(),
  [Spell.FollowWind]: powerUp(),
  [Spell.PowerOfKaishin]: powerUp(),
  [Spell.KunaiWithChain]: powerUp(),
  [Spell.Salamandra]: powerUp(),
  [Spell.Megamorph]: powerUp(2),
  [Spell.WingedTrumpeter]: powerUp(),
  [Spell.BrightCastle]: powerUp(),

  // monster-specific power-up
  [Spell.CyclonLaser]: powerUp(),
  [Spell.ElegantEgotist]: powerUp(),
  [Spell.MagicalLabyrinth]: powerUp(),
  [Spell.Cursebreaker]: powerUp(),
  [Spell.Metalmorph]: powerUp(),
  [Spell._7Completed]: powerUp(),

  // power-down
  [Spell.SpellbindingCircle]: powerUp(-1),
  [Spell.ShadowSpell]: powerUp(-2),

  // field
  [Spell.Forest]: setField(Field.Forest),
  [Spell.Wasteland]: setField(Field.Wasteland),
  [Spell.Mountain]: setField(Field.Mountain),
  [Spell.Sogen]: setField(Field.Sogen),
  [Spell.Umi]: setField(Field.Umi),
  [Spell.Yami]: setField(Field.Yami),

  // card destruction
  [Spell.FinalDestiny]: destroyRows([
    FieldRow.PlayerHand,
    FieldRow.PlayerSpellTrap,
    FieldRow.PlayerMonster,
    FieldRow.OpponentMonster,
    FieldRow.OpponentSpellTrap,
    FieldRow.OpponentHand,
  ]),
  [Spell.HeavyStorm]: destroyRows([
    FieldRow.PlayerSpellTrap,
    FieldRow.PlayerMonster,
    FieldRow.OpponentMonster,
    FieldRow.OpponentSpellTrap,
  ]),
  [Spell.DarkHole]: destroyRows([
    FieldRow.PlayerMonster,
    FieldRow.OpponentMonster,
  ]),
  [Spell.Raigeki]: destroyRows([FieldRow.OpponentMonster]),
  [Spell.CrushCard]: destroy1500PlusAtk(),
  [Spell.HarpiesFeatherDuster]: destroyRows([FieldRow.OpponentSpellTrap]),
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
        ...generateOccupiedMonsterZone(getCard("Change Slime") as MonsterCard),
        hasAttacked: true,
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
    if (!targetState.graveyard) return; // no monster to revive
    try {
      const zoneIdx = getFirstEmptyZoneIdx(originatorState.monsterZones);
      originatorState.monsterZones[zoneIdx] = {
        ...generateOccupiedMonsterZone(
          getCard(targetState.graveyard) as MonsterCard
        ),
      };
      clearGraveyard(targetState);
    } catch (e) {
      // no free zone to summon monster
    }
  },
  [Spell.GravediggerGhoul]: ({ originatorState, targetState }) => {
    clearGraveyard(originatorState);
    clearGraveyard(targetState);
  },
  [Spell.MessengerOfPeace]: ({ originatorState, targetState }) => {
    // TODO
  },
  [Spell.DarknessApproaches]: ({ originatorState }) => {
    setRowFaceDown(originatorState.monsterZones);
  },
  [Spell.BrainControl]: ({ originatorState, targetState }) => {
    // TODO
  },
  [Spell.ChangeOfHeart]: ({ originatorState, targetState }) => {
    const targetZoneIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetZoneIdx === -1) return; // no monster to target
    const targetZone = targetState.monsterZones[
      targetZoneIdx
    ] as OccupiedMonsterZone;
    try {
      const originZoneIdx = getFirstEmptyZoneIdx(originatorState.monsterZones);
      originatorState.monsterZones[originZoneIdx] = {
        ...targetZone,
        battlePosition: BattlePosition.Attack,
        orientation: Orientation.FaceUp,
      };
      clearZone(targetState.monsterZones, targetZoneIdx);
    } catch (e) {
      // no space to put new monster
    }
  },
  [Spell.Multiply]: ({ originatorState }) => {
    if (!containsCard(originatorState.monsterZones, "Kuriboh")) return;

    originatorState.monsterZones.forEach((zone, idx, row) => {
      if (zone.isOccupied) return;
      row[idx] = {
        ...generateOccupiedMonsterZone(getCard("Kuriboh") as MonsterCard),
        hasAttacked: true,
      };
    });
  },
  [Spell.PotOfGreed]: draw(2),
  [Spell.TheInexperiencedSpy]: ({ targetState }) => {
    setRowFaceUp(targetState.hand);
  },
};

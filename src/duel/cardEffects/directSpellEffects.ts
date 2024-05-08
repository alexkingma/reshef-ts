import { DuellistKey, Field, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { Spell } from "../enums/spellTrapRitual";
import { burn, getActiveEffects } from "../util/duellistUtil";
import {
  effDi_BurnSpell,
  effDi_EquipSpell,
  effDi_HealSpell,
  effDi_TypeDestructionSpell,
} from "../util/effectsUtil";
import { clearGraveyard, resurrectEnemy } from "../util/graveyardUtil";
import {
  countMatchesInRow,
  getRow,
  rowContainsAnyCards,
  setRowFaceDown,
  setRowFaceUp,
  updateMonsters,
} from "../util/rowUtil";
import {
  destroy1500PlusAtk,
  destroyHighestAtk,
  destroyRows,
  draw,
  setOwnField,
} from "../util/wrappedUtil";
import {
  convertMonster,
  convertMonsterCurrentTurn,
  getZone,
  isOccupied,
  setAtkMode,
  specialSummon,
  transformMonster,
} from "../util/zoneUtil";

export const spellEffects: CardEffectMap<DirectEffectReducer> = {
  // burn
  [Spell.Sparks]: effDi_BurnSpell(50),
  [Spell.Hinotama]: effDi_BurnSpell(100),
  [Spell.FinalFlame]: effDi_BurnSpell(200),
  [Spell.Ookazi]: effDi_BurnSpell(500),
  [Spell.TremendousFire]: effDi_BurnSpell(1000),
  [Spell.RestructerRevolution]: {
    effect: (state, { otherDKey, otherHand }) => {
      burn(state, otherDKey, countMatchesInRow(state, otherHand) * 200);
    },
    dialogue: "TODO",
  },

  // heal
  [Spell.MooyanCurry]: effDi_HealSpell(200),
  [Spell.RedMedicine]: effDi_HealSpell(500),
  [Spell.GoblinsSecretRemedy]: effDi_HealSpell(1000),
  [Spell.SoulOfThePure]: effDi_HealSpell(2000),
  [Spell.DianKetoTheCureMaster]: effDi_HealSpell(5000),

  // power-up
  [Spell.LegendarySword]: effDi_EquipSpell(),
  [Spell.SwordOfDarkDestruction]: effDi_EquipSpell(),
  [Spell.DarkEnergy]: effDi_EquipSpell(),
  [Spell.AxeOfDespair]: effDi_EquipSpell(),
  [Spell.LaserCannonArmor]: effDi_EquipSpell(),
  [Spell.InsectArmorWithLaserCannon]: effDi_EquipSpell(),
  [Spell.ElfsLight]: effDi_EquipSpell(),
  [Spell.BeastFangs]: effDi_EquipSpell(),
  [Spell.SteelShell]: effDi_EquipSpell(),
  [Spell.VileGerms]: effDi_EquipSpell(),
  [Spell.BlackPendant]: effDi_EquipSpell(),
  [Spell.SilverBowAndArrow]: effDi_EquipSpell(),
  [Spell.HornOfLight]: effDi_EquipSpell(),
  [Spell.HornOfTheUnicorn]: effDi_EquipSpell(),
  [Spell.DragonTreasure]: effDi_EquipSpell(),
  [Spell.ElectroWhip]: effDi_EquipSpell(),
  [Spell.CyberShield]: effDi_EquipSpell(),
  [Spell.MysticalMoon]: effDi_EquipSpell(),
  [Spell.MalevolentNuzzler]: effDi_EquipSpell(),
  [Spell.VioletCrystal]: effDi_EquipSpell(),
  [Spell.BookOfSecretArts]: effDi_EquipSpell(),
  [Spell.Invigoration]: effDi_EquipSpell(),
  [Spell.MachineConversionFactory]: effDi_EquipSpell(),
  [Spell.RaiseBodyHeat]: effDi_EquipSpell(),
  [Spell.FollowWind]: effDi_EquipSpell(),
  [Spell.PowerOfKaishin]: effDi_EquipSpell(),
  [Spell.KunaiWithChain]: effDi_EquipSpell(),
  [Spell.Salamandra]: effDi_EquipSpell(),
  [Spell.Megamorph]: effDi_EquipSpell(),
  [Spell.WingedTrumpeter]: effDi_EquipSpell(),
  [Spell.BrightCastle]: effDi_EquipSpell(),

  // monster-specific power-up
  [Spell.CyclonLaser]: effDi_EquipSpell(),
  [Spell.MagicalLabyrinth]: effDi_EquipSpell(),
  [Spell._7Completed]: effDi_EquipSpell(),

  // power-down
  [Spell.SpellbindingCircle]: {
    effect: (state, { otherMonsters }) => {
      updateMonsters(state, otherMonsters, (z) => {
        z.permPowerUpAtk -= 500;
        z.permPowerUpDef -= 500;
      });
    },
    dialogue: "TODO",
  },
  [Spell.ShadowSpell]: {
    effect: (state, { otherMonsters }) => {
      updateMonsters(state, otherMonsters, (z) => {
        z.permPowerUpAtk -= 1000;
        z.permPowerUpDef -= 1000;
      });
    },
    dialogue: "TODO",
  },

  // field
  [Spell.Forest]: {
    effect: setOwnField(Field.Forest),
    dialogue: "TODO",
  },
  [Spell.Wasteland]: {
    effect: setOwnField(Field.Wasteland),
    dialogue: "TODO",
  },
  [Spell.Mountain]: {
    effect: setOwnField(Field.Mountain),
    dialogue: "TODO",
  },
  [Spell.Sogen]: {
    effect: setOwnField(Field.Sogen),
    dialogue: "TODO",
  },
  [Spell.Umi]: {
    effect: setOwnField(Field.Umi),
    dialogue: "TODO",
  },
  [Spell.Yami]: {
    effect: setOwnField(Field.Yami),
    dialogue: "TODO",
  },

  // card destruction
  [Spell.FinalDestiny]: {
    effect: destroyRows([
      [DuellistKey.Player, RowKey.Hand],
      [DuellistKey.Player, RowKey.SpellTrap],
      [DuellistKey.Player, RowKey.Monster],
      [DuellistKey.Opponent, RowKey.Monster],
      [DuellistKey.Opponent, RowKey.SpellTrap],
      [DuellistKey.Opponent, RowKey.Hand],
    ]),
    dialogue: "TODO",
  },
  [Spell.HeavyStorm]: {
    effect: destroyRows([
      [DuellistKey.Player, RowKey.SpellTrap],
      [DuellistKey.Player, RowKey.Monster],
      [DuellistKey.Opponent, RowKey.Monster],
      [DuellistKey.Opponent, RowKey.SpellTrap],
    ]),
    dialogue: "TODO",
  },
  [Spell.DarkHole]: {
    effect: destroyRows([
      [DuellistKey.Player, RowKey.Monster],
      [DuellistKey.Opponent, RowKey.Monster],
    ]),
    dialogue: "TODO",
  },
  [Spell.Raigeki]: {
    effect: destroyRows([[DuellistKey.Opponent, RowKey.Monster]]),
    dialogue: "TODO",
  },
  [Spell.CrushCard]: {
    effect: destroy1500PlusAtk(),
    dialogue: "TODO",
  },
  [Spell.HarpiesFeatherDuster]: {
    effect: destroyRows([[DuellistKey.Opponent, RowKey.SpellTrap]]),
    dialogue: "TODO",
  },
  [Spell.BeckonToDarkness]: {
    effect: destroyHighestAtk(),
    dialogue: "TODO",
  },

  // type-specific destruction
  [Spell.WarriorElimination]: effDi_TypeDestructionSpell("Warrior"),
  [Spell.EternalRest]: effDi_TypeDestructionSpell("Zombie"),
  [Spell.StainStorm]: effDi_TypeDestructionSpell("Machine"),
  [Spell.EradicatingAerosol]: effDi_TypeDestructionSpell("Insect"),
  [Spell.BreathOfLight]: effDi_TypeDestructionSpell("Rock"),
  [Spell.EternalDrought]: effDi_TypeDestructionSpell("Fish"),
  [Spell.ExileOfTheWicked]: effDi_TypeDestructionSpell("Fiend"),
  [Spell.LastDayOfWitch]: effDi_TypeDestructionSpell("Spellcaster"),

  // assorted
  [Spell.Cursebreaker]: {
    effect: (state, { ownMonsters }) => {
      // restores the power-up levels of all player's powered-down monsters
      updateMonsters(state, ownMonsters, (z) => {
        z.permPowerUpAtk = Math.max(0, z.permPowerUpAtk);
        z.permPowerUpDef = Math.max(0, z.permPowerUpDef);
      });
    },
    dialogue: "TODO",
  },
  [Spell.Metalmorph]: {
    effect: (state) => {
      const { targetCoords } = state.interaction;
      const z = getZone(state, targetCoords!) as OccupiedMonsterZone;
      if (z.id === Monster.Zoa) {
        transformMonster(z, Monster.Metalzoa);
        return;
      }
      if (z.id === Monster.JiraiGumo) {
        transformMonster(z, Monster.LauncherSpider);
        return;
      }
      if (z.id === Monster.RedEyesBDragon) {
        transformMonster(z, Monster.RedEyesBlackMetalDragon);
        return;
      }
    },
    dialogue: "TODO",
  },
  [Spell.ElegantEgotist]: {
    effect: (state) => {
      const { targetCoords } = state.interaction;
      const z = getZone(state, targetCoords!) as OccupiedMonsterZone;
      transformMonster(z, Monster.HarpieLadySisters);
    },
    dialogue: "TODO",
  },
  [Spell.StopDefense]: {
    effect: (state, { otherMonsters }) => {
      // TODO: stop DEF mode for duellist as a whole for a turn, don't just move current monsters' pos
      updateMonsters(state, otherMonsters, setAtkMode);
    },
    dialogue: "TODO",
  },
  [Spell.SwordsOfRevealingLight]: {
    effect: (state, { dKey }) => {
      const activeEffects = getActiveEffects(state, dKey);
      activeEffects.sorlTurnsRemaining = 3;
    },
    dialogue: "TODO",
  },
  [Spell.DarkPiercingLight]: {
    effect: (state, { otherMonsters }) => {
      setRowFaceUp(state, otherMonsters);
    },
    dialogue: "TODO",
  },
  [Spell.MonsterReborn]: {
    effect: (state, { dKey }) => {
      resurrectEnemy(state, dKey);
    },
    dialogue: "TODO",
  },
  [Spell.GravediggerGhoul]: {
    effect: (state, { dKey, otherDKey }) => {
      clearGraveyard(state, dKey);
      clearGraveyard(state, otherDKey);
    },
    dialogue: "TODO",
  },
  [Spell.DarknessApproaches]: {
    effect: (state, { ownMonsters, ownSpellTrap }) => {
      setRowFaceDown(state, ownMonsters);
      setRowFaceDown(state, ownSpellTrap);
    },
    dialogue: "TODO",
  },
  [Spell.BrainControl]: {
    effect: (state, { dKey }) => {
      convertMonsterCurrentTurn(state, dKey);
    },
    dialogue: "TODO",
  },
  [Spell.ChangeOfHeart]: {
    effect: (state, { dKey }) => {
      convertMonster(state, dKey);
    },
    dialogue: "TODO",
  },
  [Spell.Multiply]: {
    effect: (state, { ownMonsters, dKey }) => {
      if (!rowContainsAnyCards(state, ownMonsters, Monster.Kuriboh)) return;

      const monsterZones = getRow(state, ownMonsters) as MonsterZone[];
      monsterZones.forEach((z) => {
        if (isOccupied(z)) return;
        specialSummon(state, dKey, Monster.Kuriboh, { isLocked: true });
      });
    },
    dialogue: "TODO",
  },
  [Spell.PotOfGreed]: {
    effect: draw(2),
    dialogue: "TODO",
  },
  [Spell.TheInexperiencedSpy]: {
    effect: (state, { otherHand }) => {
      setRowFaceUp(state, otherHand);
    },
    dialogue: "TODO",
  },
};

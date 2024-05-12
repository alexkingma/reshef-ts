import {
  CardTextPrefix as Pre,
  EffectDialogueTag as Tag,
} from "../enums/dialogue";
import { DKey, Field, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { Spell } from "../enums/spellTrapRitual";
import { burn, getActiveEffects } from "../util/duellistUtil";
import {
  effect_BurnSpell,
  effect_EquipSpell,
  effect_HealSpell,
  effect_TypeDestructionSpell,
} from "../util/effectsUtil";
import { clearGraveyard, resurrectEnemy } from "../util/graveyardUtil";
import {
  countMatchesInRow,
  destroyHighestAtk,
  getRow,
  rowContainsAnyCards,
  setRowFaceDown,
  setRowFaceUp,
  updateMonsters,
} from "../util/rowUtil";
import {
  destroy1500PlusAtk,
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
  transformZone,
} from "../util/zoneUtil";

export const spellEffects: CardEffectMap<DirectEffectReducer> = {
  // burn
  [Spell.Sparks]: effect_BurnSpell(50),
  [Spell.Hinotama]: effect_BurnSpell(100),
  [Spell.FinalFlame]: effect_BurnSpell(200),
  [Spell.Ookazi]: effect_BurnSpell(500),
  [Spell.TremendousFire]: effect_BurnSpell(1000),
  [Spell.RestructerRevolution]: {
    effect: (state, { otherDKey, otherHand }) => {
      burn(state, otherDKey, countMatchesInRow(state, otherHand) * 200);
    },
    text: `${Pre.Manual}The opponent takes 200LP damage for each card in his/her hand.`,
  },

  // heal
  [Spell.MooyanCurry]: effect_HealSpell(200),
  [Spell.RedMedicine]: effect_HealSpell(500),
  [Spell.GoblinsSecretRemedy]: effect_HealSpell(1000),
  [Spell.SoulOfThePure]: effect_HealSpell(2000),
  [Spell.DianKetoTheCureMaster]: effect_HealSpell(5000),

  // power-up
  [Spell.LegendarySword]: effect_EquipSpell(),
  [Spell.SwordOfDarkDestruction]: effect_EquipSpell(),
  [Spell.DarkEnergy]: effect_EquipSpell(),
  [Spell.AxeOfDespair]: effect_EquipSpell(),
  [Spell.LaserCannonArmor]: effect_EquipSpell(),
  [Spell.InsectArmorWithLaserCannon]: effect_EquipSpell(),
  [Spell.ElfsLight]: effect_EquipSpell(),
  [Spell.BeastFangs]: effect_EquipSpell(),
  [Spell.SteelShell]: effect_EquipSpell(),
  [Spell.VileGerms]: effect_EquipSpell(),
  [Spell.BlackPendant]: effect_EquipSpell(),
  [Spell.SilverBowAndArrow]: effect_EquipSpell(),
  [Spell.HornOfLight]: effect_EquipSpell(),
  [Spell.HornOfTheUnicorn]: effect_EquipSpell(),
  [Spell.DragonTreasure]: effect_EquipSpell(),
  [Spell.ElectroWhip]: effect_EquipSpell(),
  [Spell.CyberShield]: effect_EquipSpell(),
  [Spell.MysticalMoon]: effect_EquipSpell(),
  [Spell.MalevolentNuzzler]: effect_EquipSpell(),
  [Spell.VioletCrystal]: effect_EquipSpell(),
  [Spell.BookOfSecretArts]: effect_EquipSpell(),
  [Spell.Invigoration]: effect_EquipSpell(),
  [Spell.MachineConversionFactory]: effect_EquipSpell(),
  [Spell.RaiseBodyHeat]: effect_EquipSpell(),
  [Spell.FollowWind]: effect_EquipSpell(),
  [Spell.PowerOfKaishin]: effect_EquipSpell(),
  [Spell.KunaiWithChain]: effect_EquipSpell(),
  [Spell.Salamandra]: effect_EquipSpell(),
  [Spell.Megamorph]: effect_EquipSpell(),
  [Spell.WingedTrumpeter]: effect_EquipSpell(),
  [Spell.BrightCastle]: effect_EquipSpell(),

  // monster-specific power-up
  [Spell.CyclonLaser]: effect_EquipSpell(),
  [Spell.MagicalLabyrinth]: effect_EquipSpell(),
  [Spell._7Completed]: effect_EquipSpell(),

  // power-down
  [Spell.SpellbindingCircle]: {
    effect: (state, { otherMonsters }) => {
      updateMonsters(state, otherMonsters, (z) => {
        z.permPowerUpAtk -= 500;
        z.permPowerUpDef -= 500;
      });
    },
    text: `${Pre.Manual}All monsters on the foe's field will be weakened.`,
  },
  [Spell.ShadowSpell]: {
    effect: (state, { otherMonsters }) => {
      updateMonsters(state, otherMonsters, (z) => {
        z.permPowerUpAtk -= 1000;
        z.permPowerUpDef -= 1000;
      });
    },
    text: `${Pre.Manual}All monsters on the foe's field will be weakened by two levels.`,
  },
  // field
  [Spell.Forest]: {
    effect: setOwnField(Field.Forest),
    text: `${Pre.Manual}The field is transformed into a forest.\nBeast warriors, beasts, insects, and plants will gain field power.`,
  },
  [Spell.Wasteland]: {
    effect: setOwnField(Field.Wasteland),
    text: `${Pre.Manual}The field is transformed into a wasteland.\nZombies, dinosaurs, and rock-type monsters will gain field power.`,
  },
  [Spell.Mountain]: {
    effect: setOwnField(Field.Mountain),
    text: `${Pre.Manual}The field is transformed into a mountain.\nDragons, winged beasts, and thunder types will gain field power.`,
  },
  [Spell.Sogen]: {
    effect: setOwnField(Field.Sogen),
    text: `${Pre.Manual}The field is transformed into a meadow.\nWarriors and beast warriors will gain field power.`,
  },
  [Spell.Umi]: {
    effect: setOwnField(Field.Umi),
    text: `${Pre.Manual}The field is transformed into a sea.\nAqua, sea serpent, and thunder monsters will gain field power.\nMachines and pyro monsters will be weakened.`,
  },
  [Spell.Yami]: {
    effect: setOwnField(Field.Yami),
    text: `${Pre.Manual}The field is transformed into darkness.\nSpellcasters and fiends will gain power.\nFairies will be weakened.`,
  },

  // card destruction
  [Spell.FinalDestiny]: {
    effect: destroyRows([
      [DKey.Player, RowKey.Hand],
      [DKey.Player, RowKey.SpellTrap],
      [DKey.Player, RowKey.Monster],
      [DKey.Opponent, RowKey.Monster],
      [DKey.Opponent, RowKey.SpellTrap],
      [DKey.Opponent, RowKey.Hand],
    ]),
    text: `${Pre.Manual}Every monster, spell, and trap card on the field and in the hand will be destroyed.`,
  },
  [Spell.HeavyStorm]: {
    effect: destroyRows([
      [DKey.Player, RowKey.SpellTrap],
      [DKey.Player, RowKey.Monster],
      [DKey.Opponent, RowKey.Monster],
      [DKey.Opponent, RowKey.SpellTrap],
    ]),
    text: `${Pre.Manual}Every monster, spell, and trap card on the field will be destroyed.`,
  },
  [Spell.DarkHole]: {
    effect: destroyRows([
      [DKey.Player, RowKey.Monster],
      [DKey.Opponent, RowKey.Monster],
    ]),
    text: `${Pre.Manual}All monsters on the field will be wiped out.`,
  },
  [Spell.Raigeki]: {
    effect: destroyRows([[DKey.Opponent, RowKey.Monster]]),
    text: `${Pre.Manual}All enemies on the field will be wiped out.`,
  },
  [Spell.CrushCard]: {
    effect: destroy1500PlusAtk(),
    text: `${Pre.Manual}All monsters on the foe's field with ATK of 1,500 or higher will be destroyed.`,
  },
  [Spell.HarpiesFeatherDuster]: {
    effect: destroyRows([[DKey.Opponent, RowKey.SpellTrap]]),
    text: `${Pre.Manual}All spells and traps on the foe's field are eradicated.`,
  },
  [Spell.BeckonToDarkness]: {
    effect: (state, { otherDKey }) => {
      destroyHighestAtk(state, otherDKey);
    },
    text: `${Pre.Manual}It will carry off a monster on the foe's field to the afterlife.`,
  },

  // type-specific destruction
  [Spell.WarriorElimination]: effect_TypeDestructionSpell("Warrior"),
  [Spell.EternalRest]: effect_TypeDestructionSpell("Zombie"),
  [Spell.StainStorm]: effect_TypeDestructionSpell("Machine"),
  [Spell.EradicatingAerosol]: effect_TypeDestructionSpell("Insect"),
  [Spell.BreathOfLight]: effect_TypeDestructionSpell("Rock"),
  [Spell.EternalDrought]: effect_TypeDestructionSpell("Fish"),
  [Spell.ExileOfTheWicked]: effect_TypeDestructionSpell("Fiend"),
  [Spell.LastDayOfWitch]: effect_TypeDestructionSpell("Spellcaster"),

  // assorted
  [Spell.Metalmorph]: {
    effect: (state) => {
      const { targetCoords } = state.interaction;
      const z = getZone(state, targetCoords!) as OccupiedMonsterZone;
      if (z.id === Monster.Zoa) {
        transformZone(z, Monster.Metalzoa);
      } else if (z.id === Monster.JiraiGumo) {
        transformZone(z, Monster.LauncherSpider);
      } else if (z.id === Monster.RedEyesBDragon) {
        transformZone(z, Monster.RedEyesBlackMetalDragon);
      }
    },
    text: `${Pre.Manual}A monster is made stronger through metalization.`,
  },
  [Spell.ElegantEgotist]: {
    effect: (state) => {
      const { targetCoords } = state.interaction;
      transformMonster(state, targetCoords!, Monster.HarpieLadySisters);
    },
    text: `${Pre.Manual}${Tag.TargetZone} will be transformed into Harpie Lady Sisters.`,
  },
  [Spell.Cursebreaker]: {
    effect: (state, { ownMonsters }) => {
      updateMonsters(state, ownMonsters, (z) => {
        z.permPowerUpAtk = Math.max(0, z.permPowerUpAtk);
        z.permPowerUpDef = Math.max(0, z.permPowerUpDef);
      });
    },
    text: `${Pre.Manual}All powered down monsters on the player's field are restored.`,
  },
  [Spell.StopDefense]: {
    effect: (state, { otherMonsters }) => {
      // TODO: stop DEF mode for duellist as a whole for a turn, don't just move current monsters' pos
      updateMonsters(state, otherMonsters, setAtkMode);
    },
    text: `${Pre.Manual}For one turn, all enemy monsters on the field cannot defend.`,
  },
  [Spell.SwordsOfRevealingLight]: {
    effect: (state, { dKey }) => {
      const activeEffects = getActiveEffects(state, dKey);
      activeEffects.sorlTurnsRemaining = 3;
    },
    text: `${Pre.Manual}The opponent will be unable to attack for three turns.\nAll monsters on the enemy's field will be identified by the swords' light.`,
  },
  [Spell.DarkPiercingLight]: {
    effect: (state, { otherMonsters }) => {
      setRowFaceUp(state, otherMonsters);
    },
    text: `${Pre.Manual}All monsters on the enemy's field will be identified.`,
  },
  [Spell.MonsterReborn]: {
    effect: (state, { dKey }) => {
      resurrectEnemy(state, dKey);
    },
    text: `${Pre.Manual}A monster in the foe's graveyard will be revived on the player's field.`,
  },
  [Spell.GravediggerGhoul]: {
    effect: (state, { dKey, otherDKey }) => {
      clearGraveyard(state, dKey);
      clearGraveyard(state, otherDKey);
    },
    text: `${Pre.Manual}The ghoul will carry off all the monsters in the graveyards.`,
  },
  [Spell.DarknessApproaches]: {
    effect: (state, { ownMonsters, ownSpellTrap }) => {
      setRowFaceDown(state, ownMonsters);
      setRowFaceDown(state, ownSpellTrap);
    },
    text: `${Pre.Manual}All cards on the own field are turned face down.`,
  },
  [Spell.BrainControl]: {
    effect: (state, { dKey }) => {
      convertMonsterCurrentTurn(state, dKey);
    },
    text: `${Pre.Manual}For one turn, a monster on the foe's field is under mind control.`,
  },
  [Spell.ChangeOfHeart]: {
    effect: (state, { dKey }) => {
      convertMonster(state, dKey);
    },
    text: `${Pre.Manual}A monster on the foe's field will be made an ally.`,
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
    text: `${Pre.Manual}Kuriboh on the player's field will multiply.`,
  },
  [Spell.PotOfGreed]: {
    effect: draw(2),
    text: `${Pre.Manual}Up to two cards may be drawn from the deck if there is space in the hand.`,
  },
  [Spell.TheInexperiencedSpy]: {
    effect: (state, { otherHand }) => {
      setRowFaceUp(state, otherHand);
    },
    text: `${Pre.Manual}The opponent's hand will be revealed.`,
  },
};

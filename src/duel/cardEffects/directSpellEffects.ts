import { BattlePosition, DuellistKey, Field, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { DirectSpell, Spell } from "../enums/spellTrapRitual_v1.0";
import { burn, getActiveEffects } from "../util/duellistUtil";
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
  burnOther,
  destroy1500PlusAtk,
  destroyHighestAtk,
  destroyMonsterType,
  destroyRows,
  draw,
  healSelf,
  permPowerUp,
  setOwnField,
} from "../util/wrappedUtil";
import {
  convertMonster,
  convertMonsterCurrentTurn,
  getZone,
  specialSummon,
  transformMonster,
} from "../util/zoneUtil";

export const spellEffects: CardReducerMap<DirectSpell, DirectEffectReducer> = {
  // burn
  [Spell.Sparks]: burnOther(50),
  [Spell.Hinotama]: burnOther(100),
  [Spell.FinalFlame]: burnOther(200),
  [Spell.Ookazi]: burnOther(500),
  [Spell.TremendousFire]: burnOther(1000),
  [Spell.RestructerRevolution]: (state, { otherDKey, otherHand }) =>
    burn(state, otherDKey, countMatchesInRow(state, otherHand) * 200),

  // heal
  [Spell.MooyanCurry]: healSelf(200),
  [Spell.RedMedicine]: healSelf(500),
  [Spell.GoblinsSecretRemedy]: healSelf(1000),
  [Spell.SoulOfThePure]: healSelf(2000),
  [Spell.DianKetoTheCureMaster]: healSelf(5000),

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
  [Spell.Megamorph]: permPowerUp(),
  [Spell.WingedTrumpeter]: permPowerUp(),
  [Spell.BrightCastle]: permPowerUp(),

  // monster-specific power-up
  [Spell.CyclonLaser]: permPowerUp(),
  [Spell.MagicalLabyrinth]: permPowerUp(),
  [Spell._7Completed]: permPowerUp(),

  // power-down
  [Spell.SpellbindingCircle]: (state, { otherMonsters }) => {
    updateMonsters(state, otherMonsters, (z) => {
      z.permPowerUpAtk--;
      z.permPowerUpDef--;
    });
  },
  [Spell.ShadowSpell]: (state, { otherMonsters }) => {
    updateMonsters(state, otherMonsters, (z) => {
      z.permPowerUpAtk -= 2;
      z.permPowerUpDef -= 2;
    });
  },

  // field
  [Spell.Forest]: setOwnField(Field.Forest),
  [Spell.Wasteland]: setOwnField(Field.Wasteland),
  [Spell.Mountain]: setOwnField(Field.Mountain),
  [Spell.Sogen]: setOwnField(Field.Sogen),
  [Spell.Umi]: setOwnField(Field.Umi),
  [Spell.Yami]: setOwnField(Field.Yami),

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
  [Spell.Cursebreaker]: (state, { ownMonsters }) => {
    // restores the power-up levels of all player's powered-down monsters
    updateMonsters(state, ownMonsters, (z) => {
      z.permPowerUpAtk = Math.max(0, z.permPowerUpAtk);
      z.permPowerUpDef = Math.max(0, z.permPowerUpDef);
    });
  },
  [Spell.Metalmorph]: (state) => {
    const { targetCoords } = state.interaction;
    const z = getZone(state, targetCoords!) as OccupiedMonsterZone;
    if (z.card.id === Monster.Zoa) {
      transformMonster(state, targetCoords!, Monster.Metalzoa);
      return;
    }
    if (z.card.id === Monster.JiraiGumo) {
      transformMonster(state, targetCoords!, Monster.LauncherSpider);
      return;
    }
    if (z.card.id === Monster.RedEyesBDragon) {
      transformMonster(state, targetCoords!, Monster.RedEyesBlackMetalDragon);
      return;
    }
  },
  [Spell.ElegantEgotist]: (state) => {
    const { targetCoords } = state.interaction;
    transformMonster(state, targetCoords!, Monster.HarpieLadySisters);
  },
  [Spell.StopDefense]: (state, { otherMonsters }) => {
    // TODO: stop DEF mode for duellist as a whole for a turn, don't just move current monsters' pos
    updateMonsters(state, otherMonsters, (z) => {
      z.battlePosition = BattlePosition.Attack;
    });
  },
  [Spell.SwordsOfRevealingLight]: (state, { dKey }) => {
    const activeEffects = getActiveEffects(state, dKey);
    activeEffects.sorlTurnsRemaining = 3;
  },
  [Spell.DarkPiercingLight]: (state, { otherMonsters }) => {
    setRowFaceUp(state, otherMonsters);
  },
  [Spell.MonsterReborn]: (state, { dKey }) => {
    resurrectEnemy(state, dKey);
  },
  [Spell.GravediggerGhoul]: (state, { dKey, otherDKey }) => {
    clearGraveyard(state, dKey);
    clearGraveyard(state, otherDKey);
  },
  [Spell.DarknessApproaches]: (state, { ownMonsters, ownSpellTrap }) => {
    setRowFaceDown(state, ownMonsters);
    setRowFaceDown(state, ownSpellTrap);
  },
  [Spell.BrainControl]: (state, { dKey }) => {
    convertMonsterCurrentTurn(state, dKey);
  },
  [Spell.ChangeOfHeart]: (state, { dKey }) => {
    convertMonster(state, dKey);
  },
  [Spell.Multiply]: (state, { ownMonsters, dKey }) => {
    if (!rowContainsAnyCards(state, ownMonsters, Monster.Kuriboh)) return;

    const monsterZones = getRow(state, ownMonsters) as MonsterZone[];
    monsterZones.forEach((z) => {
      if (z.isOccupied) return;
      specialSummon(state, dKey, Monster.Kuriboh, { isLocked: true });
    });
  },
  [Spell.PotOfGreed]: draw(2),
  [Spell.TheInexperiencedSpy]: (state, { otherHand }) => {
    setRowFaceUp(state, otherHand);
  },
};

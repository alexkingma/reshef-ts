import {
  BattlePosition,
  DirectSpell,
  DuellistKey,
  Field,
  Monster,
  RowKey,
  Spell,
} from "../common";
import { burn, getActiveEffects } from "../util/duellistUtil";
import { clearGraveyard, resurrectEnemy } from "../util/graveyardUtil";
import {
  countMatchesInRow,
  getRow,
  rowContainsAnyCards,
  setRowFaceDown,
  setRowFaceUp,
  updateMatchesInRow,
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
  setField,
} from "../util/wrappedUtil";
import {
  convertMonster,
  getZone,
  specialSummon,
  specialSummonAtCoords,
} from "../util/zoneUtil";

export const spellEffectReducers: CardReducerMap<
  DirectSpell,
  DirectEffectReducer
> = {
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
  [Spell.Megamorph]: permPowerUp(2),
  [Spell.WingedTrumpeter]: permPowerUp(),
  [Spell.BrightCastle]: permPowerUp(),

  // monster-specific power-up
  [Spell.CyclonLaser]: permPowerUp(),
  [Spell.MagicalLabyrinth]: permPowerUp(),
  [Spell._7Completed]: permPowerUp(),

  // power-down
  [Spell.SpellbindingCircle]: (state, { otherMonsters }) => {
    updateMatchesInRow(
      state,
      otherMonsters,
      () => true,
      (z) => z.permPowerUpLevel--
    );
  },
  [Spell.ShadowSpell]: (state, { otherMonsters }) => {
    updateMatchesInRow(
      state,
      otherMonsters,
      () => true,
      (z) => (z.permPowerUpLevel -= 2)
    );
  },

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
  [Spell.Cursebreaker]: (state, { ownMonsters }) => {
    // restores the power-up levels of all player's powered-down monsters
    const monsterZones = getRow(state, ownMonsters) as MonsterZone[];
    monsterZones.forEach((z, i, zones) => {
      if (!z.isOccupied) return;
      (zones[i] as OccupiedMonsterZone).permPowerUpLevel = Math.max(
        z.permPowerUpLevel,
        0
      );
    });
  },
  [Spell.Metalmorph]: (state) => {
    const { targetCoords } = state.interaction;
    const z = getZone(state, targetCoords!) as OccupiedMonsterZone;
    // TODO: should it special summon in same orientation as original card?
    if (z.card.name === Monster.Zoa) {
      specialSummonAtCoords(state, targetCoords!, Monster.Metalzoa);
      return;
    }
    if (z.card.name === Monster.JiraiGumo) {
      specialSummonAtCoords(state, targetCoords!, Monster.LauncherSpider);
      return;
    }
    if (z.card.name === Monster.RedEyesBDragon) {
      specialSummonAtCoords(
        state,
        targetCoords!,
        Monster.RedEyesBlackMetalDragon
      );
      return;
    }
  },
  [Spell.ElegantEgotist]: (state) => {
    const { targetCoords } = state.interaction;
    // TODO: should it special summon in same orientation as original card?
    const { permPowerUpLevel } = getZone(
      state,
      targetCoords!
    ) as OccupiedMonsterZone;
    specialSummonAtCoords(state, targetCoords!, Monster.HarpieLadySisters, {
      permPowerUpLevel,
    });
  },
  [Spell.StopDefense]: (state, { otherMonsters }) => {
    const monsterZones = getRow(state, otherMonsters) as MonsterZone[];
    monsterZones.forEach((zone, idx, row) => {
      if (!zone.isOccupied) return;
      (row[idx] as OccupiedMonsterZone).battlePosition = BattlePosition.Attack;
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
  [Spell.DarknessApproaches]: (state, { ownMonsters }) => {
    setRowFaceDown(state, ownMonsters);
  },
  [Spell.BrainControl]: (state, { dKey }) => {
    const controlledMonIdx = convertMonster(state, dKey);

    if (!controlledMonIdx) return; // conversion failed, no space to house monster

    // converted monster must undo conversion on turn end
    const activeEffects = getActiveEffects(state, dKey);
    activeEffects.brainControlZones.push(controlledMonIdx);
  },
  [Spell.ChangeOfHeart]: (state, { dKey }) => {
    convertMonster(state, dKey);
  },
  [Spell.Multiply]: (state, { ownMonsters, dKey }) => {
    if (!rowContainsAnyCards(state, ownMonsters, Monster.Kuriboh)) return;

    const monsterZones = getRow(state, ownMonsters) as MonsterZone[];
    monsterZones.forEach((zone) => {
      if (zone.isOccupied) return;
      specialSummon(state, dKey, Monster.Kuriboh, { isLocked: true });
      // TODO: does this count as your normal summon for this turn?
    });
  },
  [Spell.PotOfGreed]: draw(2),
  [Spell.TheInexperiencedSpy]: (state, { otherHand }) => {
    setRowFaceUp(state, otherHand);
  },
};

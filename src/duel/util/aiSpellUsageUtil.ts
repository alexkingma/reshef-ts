import { Field } from "../enums/duel";
import { Monster } from "../enums/monster";
import { DirectSpell, Spell } from "../enums/spellTrapRitual_v1.0";
import {
  onlyOpponentHasMonster,
  opponentHasMonster,
  opponentHasSpellTrap,
  shouldUseField,
  spellHasValidTarget,
} from "./aiWrappedUtil";
import {
  isFiend,
  isFish,
  isInsect,
  isMachine,
  isRock,
  isSpellcaster,
  isWarrior,
  isZombie,
} from "./cardTypeUtil";
import { always } from "./common";
import { opponentIsUnderSoRL } from "./duellistUtil";
import { isGraveyardEmpty } from "./graveyardUtil";
import { countMatchesInRow, hasEmptyZone, hasMatchInRow } from "./rowUtil";
import {
  hasManualEffect,
  isDefMode,
  isFaceDown,
  isFaceUp,
  isNotGodCard,
  isSpecificMonster,
  isUnlocked,
} from "./zoneUtil";

export const spellUsageMap: CardReducerMap<DirectSpell, CardCondition> = {
  // burn
  [Spell.Sparks]: always,
  [Spell.Hinotama]: always,
  [Spell.FinalFlame]: always,
  [Spell.Ookazi]: always,
  [Spell.TremendousFire]: always,
  [Spell.RestructerRevolution]: always,

  // heal
  [Spell.MooyanCurry]: always,
  [Spell.RedMedicine]: always,
  [Spell.GoblinsSecretRemedy]: always,
  [Spell.SoulOfThePure]: always,
  [Spell.DianKetoTheCureMaster]: always,

  // type-specific power-up
  [Spell.LegendarySword]: spellHasValidTarget(Spell.LegendarySword),
  [Spell.SwordOfDarkDestruction]: spellHasValidTarget(
    Spell.SwordOfDarkDestruction
  ),
  [Spell.DarkEnergy]: spellHasValidTarget(Spell.DarkEnergy),
  [Spell.AxeOfDespair]: spellHasValidTarget(Spell.AxeOfDespair),
  [Spell.LaserCannonArmor]: spellHasValidTarget(Spell.LaserCannonArmor),
  [Spell.InsectArmorWithLaserCannon]: spellHasValidTarget(
    Spell.InsectArmorWithLaserCannon
  ),
  [Spell.ElfsLight]: spellHasValidTarget(Spell.ElfsLight),
  [Spell.BeastFangs]: spellHasValidTarget(Spell.BeastFangs),
  [Spell.SteelShell]: spellHasValidTarget(Spell.SteelShell),
  [Spell.VileGerms]: spellHasValidTarget(Spell.VileGerms),
  [Spell.BlackPendant]: spellHasValidTarget(Spell.BlackPendant),
  [Spell.SilverBowAndArrow]: spellHasValidTarget(Spell.SilverBowAndArrow),
  [Spell.HornOfLight]: spellHasValidTarget(Spell.HornOfLight),
  [Spell.HornOfTheUnicorn]: spellHasValidTarget(Spell.HornOfTheUnicorn),
  [Spell.DragonTreasure]: spellHasValidTarget(Spell.DragonTreasure),
  [Spell.ElectroWhip]: spellHasValidTarget(Spell.ElectroWhip),
  [Spell.CyberShield]: spellHasValidTarget(Spell.CyberShield),
  [Spell.MysticalMoon]: spellHasValidTarget(Spell.MysticalMoon),
  [Spell.MalevolentNuzzler]: spellHasValidTarget(Spell.MalevolentNuzzler),
  [Spell.VioletCrystal]: spellHasValidTarget(Spell.VioletCrystal),
  [Spell.BookOfSecretArts]: spellHasValidTarget(Spell.BookOfSecretArts),
  [Spell.Invigoration]: spellHasValidTarget(Spell.Invigoration),
  [Spell.MachineConversionFactory]: spellHasValidTarget(
    Spell.MachineConversionFactory
  ),
  [Spell.RaiseBodyHeat]: spellHasValidTarget(Spell.RaiseBodyHeat),
  [Spell.FollowWind]: spellHasValidTarget(Spell.FollowWind),
  [Spell.PowerOfKaishin]: spellHasValidTarget(Spell.PowerOfKaishin),
  [Spell.KunaiWithChain]: spellHasValidTarget(Spell.KunaiWithChain),
  [Spell.Salamandra]: spellHasValidTarget(Spell.Salamandra),
  [Spell.Megamorph]: spellHasValidTarget(Spell.Megamorph),
  [Spell.WingedTrumpeter]: spellHasValidTarget(Spell.WingedTrumpeter),
  [Spell.BrightCastle]: spellHasValidTarget(Spell.BrightCastle),

  // monster-specific power-up
  [Spell.CyclonLaser]: spellHasValidTarget(Spell.CyclonLaser),
  [Spell.ElegantEgotist]: spellHasValidTarget(Spell.ElegantEgotist),
  [Spell.MagicalLabyrinth]: spellHasValidTarget(Spell.MagicalLabyrinth),
  [Spell.Metalmorph]: spellHasValidTarget(Spell.Metalmorph),
  [Spell._7Completed]: spellHasValidTarget(Spell._7Completed),

  // power-down
  [Spell.SpellbindingCircle]: opponentHasMonster(),
  [Spell.ShadowSpell]: opponentHasMonster(),

  // field
  [Spell.Forest]: shouldUseField(Field.Forest),
  [Spell.Wasteland]: shouldUseField(Field.Wasteland),
  [Spell.Mountain]: shouldUseField(Field.Mountain),
  [Spell.Sogen]: shouldUseField(Field.Sogen),
  [Spell.Umi]: shouldUseField(Field.Umi),
  [Spell.Yami]: shouldUseField(Field.Yami),

  // general destruction
  [Spell.FinalDestiny]: (
    state,
    { ownMonsters, otherMonsters, otherSpellTrap, otherHand }
  ) =>
    !hasMatchInRow(state, ownMonsters) &&
    (hasMatchInRow(state, otherMonsters, isNotGodCard) ||
      hasMatchInRow(state, otherSpellTrap) ||
      hasMatchInRow(state, otherHand)),
  [Spell.HeavyStorm]: (state, { ownMonsters, otherMonsters, otherSpellTrap }) =>
    !hasMatchInRow(state, ownMonsters) &&
    (hasMatchInRow(state, otherMonsters, isNotGodCard) ||
      hasMatchInRow(state, otherSpellTrap)),
  [Spell.DarkHole]: (state, { ownMonsters, otherMonsters }) =>
    !hasMatchInRow(state, ownMonsters) &&
    hasMatchInRow(state, otherMonsters, isNotGodCard),
  [Spell.Raigeki]: (state, { otherMonsters }) =>
    hasMatchInRow(state, otherMonsters, isNotGodCard),
  [Spell.CrushCard]: (state, { otherMonsters }) =>
    hasMatchInRow(state, otherMonsters, isNotGodCard),
  [Spell.HarpiesFeatherDuster]: opponentHasSpellTrap(),
  [Spell.BeckonToDarkness]: (state, { otherMonsters }) =>
    hasMatchInRow(state, otherMonsters, isNotGodCard),

  // type-specific destruction
  [Spell.WarriorElimination]: onlyOpponentHasMonster(
    (z) => isWarrior(z) && isNotGodCard(z)
  ),
  [Spell.EternalRest]: onlyOpponentHasMonster(
    (z) => isZombie(z) && isNotGodCard(z)
  ),
  [Spell.StainStorm]: onlyOpponentHasMonster(
    (z) => isMachine(z) && isNotGodCard(z)
  ),
  [Spell.EradicatingAerosol]: onlyOpponentHasMonster(
    (z) => isInsect(z) && isNotGodCard(z)
  ),
  [Spell.BreathOfLight]: onlyOpponentHasMonster(
    (z) => isRock(z) && isNotGodCard(z)
  ),
  [Spell.EternalDrought]: onlyOpponentHasMonster(
    (z) => isFish(z) && isNotGodCard(z)
  ),
  [Spell.ExileOfTheWicked]: onlyOpponentHasMonster(
    (z) => isFiend(z) && isNotGodCard(z)
  ),
  [Spell.LastDayOfWitch]: onlyOpponentHasMonster(
    (z) => isSpellcaster(z) && isNotGodCard(z)
  ),

  // assorted
  [Spell.Cursebreaker]: (state, { ownMonsters }) =>
    hasMatchInRow(
      state,
      ownMonsters,
      (z) =>
        (z as OccupiedMonsterZone).permPowerUpAtk < 0 ||
        (z as OccupiedMonsterZone).permPowerUpDef < 0
    ),
  [Spell.StopDefense]: opponentHasMonster(isDefMode),
  [Spell.SwordsOfRevealingLight]: (state, { dKey }) =>
    !opponentIsUnderSoRL(state, dKey),
  [Spell.DarkPiercingLight]: opponentHasMonster(isFaceDown),
  [Spell.MonsterReborn]: (state, { otherDKey }) =>
    !isGraveyardEmpty(state, otherDKey),
  [Spell.GravediggerGhoul]: (state, { dKey, otherDKey }) =>
    !isGraveyardEmpty(state, dKey) || !isGraveyardEmpty(state, otherDKey),
  [Spell.DarknessApproaches]: (state, { ownMonsters }) =>
    hasMatchInRow(
      state,
      ownMonsters,
      (z) =>
        isFaceUp(z) &&
        hasManualEffect(z as OccupiedMonsterZone) &&
        isUnlocked(z)
    ),
  [Spell.BrainControl]: (state, { ownMonsters, otherMonsters }) =>
    hasEmptyZone(state, ownMonsters) &&
    hasMatchInRow(state, otherMonsters, isNotGodCard),
  [Spell.ChangeOfHeart]: (state, { ownMonsters, otherMonsters }) =>
    hasEmptyZone(state, ownMonsters) &&
    hasMatchInRow(state, otherMonsters, isNotGodCard),
  [Spell.Multiply]: (state, { ownMonsters }) =>
    hasEmptyZone(state, ownMonsters) &&
    hasMatchInRow(state, ownMonsters, (z) =>
      isSpecificMonster(z, Monster.Kuriboh)
    ),
  [Spell.PotOfGreed]: (state, { ownHand }) =>
    countMatchesInRow(state, ownHand) <= 3,
  [Spell.TheInexperiencedSpy]: (state, { otherHand }) =>
    hasMatchInRow(state, otherHand, isFaceDown),
};

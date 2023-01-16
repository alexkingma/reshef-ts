import {
  DuellistKey,
  Field,
  FlipEffectMonster,
  Monster,
  RowKey,
  Trap,
} from "../common";
import { getCard } from "../util/cardUtil";
import { shuffle } from "../util/common";
import { draw } from "../util/deckUtil";
import { burn, heal } from "../util/duellistUtil";
import {
  clearFirstTrap,
  countMatchesInRow,
  destroyFirstFound,
  destroyHighestAtk,
  destroyRow,
  getHighestAtkZoneIdx,
  hasMatchInRow,
  immobiliseRow,
  powerDownHighestAtk,
  rowContainsAnyCards,
  setRowFaceUp,
  updateMatchesInRow,
} from "../util/rowUtil";
import {
  burnOther,
  destroyHighestAtk as destroyHighestAtk_Wrapped,
  destroyMonsterAlignment,
  destroyMonsterType,
  destroyRows,
  draw as draw_Wrapped,
  healSelf as heal_Wrapped,
  setField as setField_Wrapped,
} from "../util/wrappedUtil";
import {
  attackMonster,
  clearZone,
  convertMonster,
  destroyAtCoords,
  directAttack,
  immobiliseCard,
  isFaceDown,
  isFaceUp,
  isSpecificMonster,
  isSpell,
  isType,
  magnetWarriorMergeAttempt,
  permPowerDown,
  permPowerUp,
  returnCardToHand,
  setSpellTrap,
  specialSummon,
  subsumeMonster,
  xyzMergeAttempt,
} from "../util/zoneUtil";

export const monsterFlipEffectReducers: CardReducerMap<
  FlipEffectMonster,
  DirectEffectReducer
> = {
  [Monster.MysticalElf]: (state, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z) => isSpecificMonster(z, Monster.BlueEyesWhiteDragon),
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.FlameSwordsman]: destroyMonsterType("Dinosaur"),
  [Monster.TimeWizard]: (state, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z) => isSpecificMonster(z, Monster.DarkMagician),
      (z) => (z.card = getCard(Monster.DarkSage) as MonsterCard)
    );
    updateMatchesInRow(
      state,
      ownMonsters,
      (z) => isSpecificMonster(z, Monster.BabyDragon),
      (z) => (z.card = getCard(Monster.ThousandDragon) as MonsterCard)
    );
  },
  [Monster.BattleOx]: destroyMonsterAlignment("Fire"),
  [Monster.CurseOfDragon]: setField_Wrapped(Field.Wasteland),
  [Monster.IllusionistFacelessMage]: (state, { otherMonsters }) => {
    immobiliseRow(state, otherMonsters);
  },
  [Monster.HarpieLady]: (state, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z) => isSpecificMonster(z, Monster.HarpiesPetDragon),
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.HarpieLadySisters]: (state, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z) => isSpecificMonster(z, Monster.HarpiesPetDragon),
      (z) => (z.permPowerUpLevel += 2)
    );
  },
  [Monster.KairyuShin]: setField_Wrapped(Field.Umi),
  [Monster.GiantSoldierOfStone]: setField_Wrapped(Field.Arena),
  [Monster.ReaperOfTheCards]: (state, { otherDKey }) => {
    clearFirstTrap(state, otherDKey);
  },
  [Monster.CatapultTurtle]: (
    state,
    { dKey, ownMonsters, otherDKey, colIdx: monsterIdx }
  ) => {
    // make all the unused monsters on the player's
    // field disappear and hit the foe with their combined power
    const idxsToClear: FieldCol[] = [];
    let combinedAtk = 0;
    state[dKey].monsterZones.forEach((zone, idx) => {
      if (!zone.isOccupied || zone.isLocked || idx === monsterIdx) return;
      idxsToClear.push(idx as FieldCol);
      combinedAtk += zone.card.atk;
    });
    idxsToClear.forEach((idx) => destroyAtCoords(state, [...ownMonsters, idx]));
    burn(state, otherDKey, combinedAtk);
  },
  [Monster.GyakutennoMegami]: (state, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z: OccupiedMonsterZone) => z.card.atk <= 500,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++
    );
  },
  [Monster.SpiritOfTheBooks]: (state, { dKey }) => {
    specialSummon(state, dKey, Monster.BooKoo);
  },
  [Monster.Nemuriko]: (state, { otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return; // no monster to target
    immobiliseCard(state, [...otherMonsters, targetIdx as FieldCol]);
  },
  [Monster.RevivalJam]: (state, { dKey }) => {
    specialSummon(state, dKey, Monster.RevivalJam, { isLocked: true });
  },
  [Monster.FiendsHand]: (state, { otherDKey, zoneCoords }) => {
    destroyHighestAtk(state, otherDKey);
    destroyAtCoords(state, zoneCoords);
  },
  [Monster.DarkNecrofear]: (state, { dKey }) => {
    convertMonster(state, dKey);
  },
  [Monster.ToadMaster]: (state, { dKey }) => {
    specialSummon(state, dKey, Monster.FrogTheJam);
  },
  [Monster.FireReaper]: burnOther(50),
  [Monster.Doron]: (state, { dKey }) => {
    specialSummon(state, dKey, Monster.Doron, { isLocked: true });
  },
  [Monster.TrapMaster]: (state, { dKey }) => {
    setSpellTrap(state, dKey, Trap.AcidTrapHole);
  },
  [Monster.HourglassOfLife]: (state, { dKey, ownMonsters }) => {
    burn(state, dKey, 1000);
    updateMatchesInRow(
      state,
      ownMonsters,
      () => true,
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.ObeliskTheTormentor]: (state, { otherMonsters, otherDKey }) => {
    destroyRow(state, otherMonsters);
    burn(state, otherDKey, 4000);
  },
  [Monster.TheWingedDragonOfRaBattleMode]: (state, { dKey, otherDKey }) => {
    const dmg = state[dKey].lp - 1;
    burn(state, dKey, dmg);
    burn(state, otherDKey, dmg);
  },
  [Monster.RocketWarrior]: (state, { dKey }) => {
    powerDownHighestAtk(state, dKey);
  },
  [Monster.BeastkingOfTheSwamps]: destroyRows([
    [DuellistKey.Player, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.Monster],
  ]),
  [Monster.FairysGift]: heal_Wrapped(1000),
  [Monster.MonsterTamer]: (state, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z) => isSpecificMonster(z, Monster.DungeonWorm),
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.MysticLamp]: (state, { colIdx: monsterIdx, zoneCoords }) => {
    directAttack(state, zoneCoords);
  },
  [Monster.Leghul]: (state, { colIdx: monsterIdx, zoneCoords }) => {
    directAttack(state, zoneCoords);
  },
  [Monster.GammaTheMagnetWarrior]: (state, { zoneCoords }) => {
    magnetWarriorMergeAttempt(state, zoneCoords);
  },
  [Monster.MonsterEye]: (state, { otherHand }) => {
    setRowFaceUp(state, otherHand);
  },
  [Monster.TheWingedDragonOfRaPhoenixMode]: (
    state,
    { dKey, otherMonsters }
  ) => {
    burn(state, dKey, 1000);
    destroyRow(state, otherMonsters);
  },
  [Monster.GoddessOfWhim]: (state, { dKey, zoneCoords }) => {
    draw(state, dKey);
    destroyAtCoords(state, zoneCoords);
  },
  [Monster.DragonSeeker]: destroyMonsterType("Dragon"),
  [Monster.PenguinTorpedo]: (state, { colIdx: monsterIdx, zoneCoords }) => {
    directAttack(state, zoneCoords);
  },
  [Monster.ZombyraTheDark]: (state, { zoneCoords, otherDKey }) => {
    destroyHighestAtk(state, otherDKey);
    permPowerDown(state, zoneCoords);
  },
  [Monster.SpiritOfTheMountain]: setField_Wrapped(Field.Mountain),
  [Monster.AncientLamp]: (state, { dKey }) => {
    specialSummon(state, dKey, Monster.LaJinnTheMysticalGenieOfTheLamp);
  },
  [Monster.Skelengel]: draw_Wrapped(),
  [Monster.KingsKnight]: (state, { dKey, ownMonsters }) => {
    if (!rowContainsAnyCards(state, ownMonsters, Monster.QueensKnight)) {
      return;
    }
    specialSummon(state, dKey, Monster.JacksKnight);
  },
  [Monster.XHeadCannon]: (state, { zoneCoords }) => {
    // note that x/y/z CANNOT merge with their "stage 2" counterparts
    // e.g. X cannot merge with YZ, only with individual Y and/or Z pieces
    xyzMergeAttempt(state, zoneCoords, [
      [[Monster.YDragonHead, Monster.ZMetalTank], Monster.XYZDragonCannon],
      [[Monster.YDragonHead], Monster.XYDragonCannon],
      [[Monster.ZMetalTank], Monster.XZTankCannon],
    ]);
  },
  [Monster.YDragonHead]: (state, { zoneCoords }) => {
    xyzMergeAttempt(state, zoneCoords, [
      [[Monster.XHeadCannon, Monster.ZMetalTank], Monster.XYZDragonCannon],
      [[Monster.XHeadCannon], Monster.XYDragonCannon],
      [[Monster.ZMetalTank], Monster.YZTankDragon],
    ]);
  },
  [Monster.ZMetalTank]: (state, { zoneCoords }) => {
    xyzMergeAttempt(state, zoneCoords, [
      [[Monster.XHeadCannon, Monster.YDragonHead], Monster.XYZDragonCannon],
      [[Monster.XHeadCannon], Monster.XZTankCannon],
      [[Monster.YDragonHead], Monster.YZTankDragon],
    ]);
  },
  [Monster.XYDragonCannon]: (state, { otherSpellTrap, ownHand }) => {
    // destroy a [face-up spell/trap] by discarding from hand
    if (!hasMatchInRow(state, otherSpellTrap, isFaceUp)) return;
    destroyFirstFound(state, ownHand);
    destroyFirstFound(state, otherSpellTrap, isFaceUp);
  },
  [Monster.XZTankCannon]: (state, { otherSpellTrap, ownHand }) => {
    // destroy a [face-down spell/trap] by discarding from hand
    if (!hasMatchInRow(state, otherSpellTrap, isFaceDown)) return;
    destroyFirstFound(state, ownHand);
    destroyFirstFound(state, otherSpellTrap, isFaceDown);
  },
  [Monster.YZTankDragon]: (state, { otherDKey, otherMonsters, ownHand }) => {
    // destroy a [face-down monster] by discarding from hand
    if (!hasMatchInRow(state, otherMonsters, isFaceDown)) return;
    destroyFirstFound(state, ownHand);
    destroyHighestAtk(state, otherDKey, isFaceDown);
  },
  [Monster.XYZDragonCannon]: (state, { otherDKey, otherMonsters, ownHand }) => {
    // destroy [any monster] by discarding from hand
    if (!hasMatchInRow(state, otherMonsters)) return;
    destroyFirstFound(state, ownHand);
    destroyHighestAtk(state, otherDKey);
  },
  [Monster.ElectricLizard]: (state, { otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return;
    immobiliseCard(state, [...otherMonsters, targetIdx]);
  },
  [Monster.LadyOfFaith]: heal_Wrapped(500),
  [Monster.ByserShock]: (
    state,
    {
      ownMonsters,
      otherMonsters,
      ownSpellTrap,
      otherSpellTrap,
      dKey,
      otherDKey,
    }
  ) => {
    // return all face-down cards on both fields to
    // the hands of both players if there is space in the hands
    const returnRowToHand =
      (rowCoords: RowCoords) => (z: Zone, idx: number) => {
        if (!z.isOccupied) return;
        returnCardToHand(state, [...rowCoords, idx as FieldCol]);
      };

    state[dKey].monsterZones.forEach(returnRowToHand(ownMonsters));
    state[dKey].spellTrapZones.forEach(returnRowToHand(ownSpellTrap));
    state[otherDKey].monsterZones.forEach(returnRowToHand(otherMonsters));
    state[otherDKey].spellTrapZones.forEach(returnRowToHand(otherSpellTrap));
  },
  [Monster.PuppetMaster]: (state, { dKey, otherDKey }) => {
    if (state[dKey].graveyard !== Monster.Gernia) return;
    specialSummon(state, dKey, Monster.DarkNecrofear);
    specialSummon(state, dKey, Monster.HeadlessKnight);
    specialSummon(state, dKey, Monster.Gernia);
    burn(state, otherDKey, 1000);
  },
  [Monster.DarkPaladin]: (state, { ownHand, otherSpellTrap }) => {
    // destroy a [spell] by discarding from hand
    if (!hasMatchInRow(state, otherSpellTrap, isSpell)) return;
    destroyFirstFound(state, ownHand);
    destroyFirstFound(state, otherSpellTrap, isSpell);
  },
  [Monster.Trent]: setField_Wrapped(Field.Forest),
  [Monster.BerserkDragon]: (
    state,
    { colIdx: monsterIdx, otherMonsters, zoneCoords, otherDKey, dKey }
  ) => {
    // attack all enemy monsters from left to right in a single action
    state[otherDKey].monsterZones.forEach((z, idx) => {
      if (!z.isOccupied || !state[dKey].monsterZones[monsterIdx].isOccupied) {
        // don't attack if Berserk Dragon itself has been destroyed
        return;
      }
      attackMonster(state, zoneCoords, [...otherMonsters, idx as FieldCol]);
    });
  },
  [Monster.DesVolstgalph]: (state, { otherDKey }) => {
    destroyHighestAtk(state, otherDKey);
    burn(state, otherDKey, 500);
  },
  [Monster.GilfordTheLightning]: destroyRows([
    [DuellistKey.Opponent, RowKey.Monster],
  ]),
  [Monster.MysticalBeastSerket]: (state, { otherMonsters, zoneCoords }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return;
    destroyAtCoords(state, [...otherMonsters, targetIdx]);
    permPowerUp(state, zoneCoords);
  },
  [Monster.CyberHarpie]: (state, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z) => isSpecificMonster(z, Monster.HarpiesPetDragon),
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.ExarionUniverse]: (state, { zoneCoords }) => {
    directAttack(state, zoneCoords);
    permPowerDown(state, zoneCoords);
  },
  [Monster.LegendaryFiend]: (state, { zoneCoords }) => {
    permPowerUp(state, zoneCoords);
  },
  [Monster.ValkyrionTheMagnaWarrior]: (
    state,
    { dKey, zoneCoords, ownMonsters }
  ) => {
    // separate into Alpha, Beta, and Gamma if there are two or more open spaces
    const numFreeZones = 5 - countMatchesInRow(state, ownMonsters);
    if (numFreeZones < 2) return; // separation fails
    const isLocked = { isLocked: true };
    clearZone(state, zoneCoords);
    specialSummon(state, dKey, Monster.AlphaTheMagnetWarrior, isLocked);
    specialSummon(state, dKey, Monster.BetaTheMagnetWarrior, isLocked);
    specialSummon(state, dKey, Monster.GammaTheMagnetWarrior, isLocked);
  },
  [Monster.FGD]: destroyRows([
    [DuellistKey.Opponent, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.SpellTrap],
  ]),
  [Monster.RedArcheryGirl]: (state, { otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return; // no monster to target
    permPowerDown(state, [...otherMonsters, targetIdx]);
    immobiliseCard(state, [...otherMonsters, targetIdx]);
  },
  [Monster.Relinquished]: (state, { zoneCoords, otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return; // no monsters to consume

    subsumeMonster(state, zoneCoords, [...otherMonsters, targetIdx]);
  },
  [Monster.ThousandEyesRestrict]: (state, { zoneCoords, otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return; // no monsters to consume

    subsumeMonster(state, zoneCoords, [...otherMonsters, targetIdx]);
    permPowerUp(state, zoneCoords, 2);
  },
  [Monster.AlphaTheMagnetWarrior]: (state, { zoneCoords }) => {
    magnetWarriorMergeAttempt(state, zoneCoords);
  },
  [Monster.InvitationToADarkSleep]: (state, { otherMonsters }) => {
    immobiliseRow(state, otherMonsters);
  },
  [Monster.BarrelDragon]: (state, { otherDKey, otherMonsters }) => {
    // select up to 3 (random, occupied) enemy monster idxs
    const idxsToTarget = shuffle(
      state[otherDKey].monsterZones.reduce((arr, z, idx) => {
        if (!z.isOccupied) return arr;
        return [...arr, idx as FieldCol];
      }, [] as FieldCol[])
    ).slice(0, 3);

    // each targeted monster has a 50% chance to be destroyed
    idxsToTarget.forEach((i) => {
      if (Math.random() > 0.5) return;
      destroyAtCoords(state, [...otherMonsters, i]);
    });
  },
  [Monster.ReflectBounder]: (
    state,
    { otherMonsters, otherDKey, zoneCoords }
  ) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return;
    const { card } = state[otherDKey].monsterZones[
      targetIdx
    ] as OccupiedMonsterZone;
    burn(state, otherDKey, card.atk);
    destroyAtCoords(state, zoneCoords);
  },
  [Monster.BetaTheMagnetWarrior]: (state, { zoneCoords }) => {
    magnetWarriorMergeAttempt(state, zoneCoords);
  },
  [Monster.ParasiteParacide]: (state, { zoneCoords, otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return;

    subsumeMonster(state, [...otherMonsters, targetIdx], zoneCoords);
  },
  [Monster.SkullMarkLadyBug]: (state, { dKey, zoneCoords }) => {
    heal(state, dKey, 500);
    destroyAtCoords(state, zoneCoords);
  },
  [Monster.PinchHopper]: (state, { zoneCoords, ownHand, dKey }) => {
    // For its own demise, it can summon (the strongest) insect from the own hand
    destroyAtCoords(state, zoneCoords);

    const handIdx = getHighestAtkZoneIdx(state, ownHand, (z: OccupiedZone) =>
      isType(z, "Insect")
    );
    if (handIdx === -1) return; // no insect to summon
    const { card } = state[dKey].hand[handIdx] as OccupiedZone;
    specialSummon(state, dKey, card.name);

    clearZone(state, [...ownHand, handIdx]);
  },
  [Monster.ChironTheMage]: destroyHighestAtk_Wrapped(),
  [Monster.BeastOfGilfer]: (state, { zoneCoords, otherMonsters }) => {
    updateMatchesInRow(
      state,
      otherMonsters,
      () => true,
      (z: OccupiedMonsterZone) => z.permPowerUpLevel--
    );
    destroyAtCoords(state, zoneCoords);
  },
};

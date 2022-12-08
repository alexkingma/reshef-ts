import {
  attackMonster,
  burn,
  clearFirstTrap,
  clearZone,
  convertMonster,
  destroyAtCoords,
  destroyHighestAtk,
  destroyRow,
  destroySelf,
  directAttack,
  draw,
  heal,
  immobiliseCard,
  immobiliseRow,
  magnetWarriorMergeAttempt,
  permPowerDown,
  permPowerUp,
  powerDownHighestAtk,
  returnCardToHand,
  setRowFaceUp,
  specialSummon,
  subsumeMonster,
  updateMatchesInRow,
} from "./cardEffectUtil";
import {
  burn as burn_Wrapped,
  destroyHighestAtk as destroyHighestAtk_Wrapped,
  destroyMonsterAlignment,
  destroyMonsterType,
  destroyRows,
  draw as draw_Wrapped,
  heal as heal_Wrapped,
  setField as setField_Wrapped,
} from "./cardEffectWrapped";
import {
  Field,
  FieldRow,
  ManualEffectMonster,
  Monster,
  Orientation,
  Trap,
} from "./common";
import { ReducerArg } from "./duelSlice";
import {
  containsCard,
  getCard,
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
  isType,
  shuffle,
} from "./duelUtil";

type MonsterManualEffectReducers = {
  [key in ManualEffectMonster]: (arg: ReducerArg, monsterIdx: FieldCol) => void;
};

export const monsterEffectReducers: MonsterManualEffectReducers = {
  [ManualEffectMonster.MysticalElf]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.name === Monster.BlueEyesWhiteDragon,
      (z) => z.permPowerUpLevel++
    );
  },
  [ManualEffectMonster.FlameSwordsman]: destroyMonsterType("Dinosaur"),
  [ManualEffectMonster.TimeWizard]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.name === Monster.DarkMagician,
      (z) => (z.card = getCard(Monster.DarkSage) as MonsterCard)
    );
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.name === Monster.BabyDragon,
      (z) => (z.card = getCard(Monster.ThousandDragon) as MonsterCard)
    );
  },
  [ManualEffectMonster.BattleOx]: destroyMonsterAlignment("Fire"),
  [ManualEffectMonster.CurseOfDragon]: setField_Wrapped(Field.Wasteland),
  [ManualEffectMonster.IllusionistFacelessMage]: ({ targetState }) => {
    immobiliseRow(targetState.monsterZones);
  },
  [ManualEffectMonster.HarpieLady]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.name === Monster.HarpiesPetDragon,
      (z) => z.permPowerUpLevel++
    );
  },
  [ManualEffectMonster.HarpieLadySisters]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.name === Monster.HarpiesPetDragon,
      (z) => (z.permPowerUpLevel += 2)
    );
  },
  [ManualEffectMonster.KairyuShin]: setField_Wrapped(Field.Umi),
  [ManualEffectMonster.GiantSoldierOfStone]: setField_Wrapped(Field.Arena),
  [ManualEffectMonster.ReaperOfTheCards]: ({ targetState }) => {
    clearFirstTrap(targetState);
  },
  [ManualEffectMonster.CatapultTurtle]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    // make all the unused monsters on the player's
    // field disappear and hit the foe with their combined power
    const idxsToClear: FieldCol[] = [];
    let combinedAtk = 0;
    originatorState.monsterZones.forEach((zone, idx) => {
      if (!zone.isOccupied || zone.isLocked || idx === monsterIdx) return;
      idxsToClear.push(idx as FieldCol);
      combinedAtk += zone.card.atk;
    });
    idxsToClear.forEach((idx) =>
      destroyAtCoords(originatorState, [FieldRow.PlayerMonster, idx])
    );
    burn(targetState, combinedAtk);
  },
  [ManualEffectMonster.GyakutennoMegami]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z: OccupiedMonsterZone) => z.card.atk <= 500,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++
    );
  },
  [ManualEffectMonster.SpiritOfTheBooks]: ({ originatorState }) => {
    specialSummon(originatorState, Monster.BooKoo);
  },
  [ManualEffectMonster.XYZDragonCannon]: ({ originatorState, targetState }) => {
    // TODO
    // destroy a monster on the opponent's field by discarding the far left card in the own hand
    // left-most card in hand is discarded, if no cards, no penalty
  },
  [ManualEffectMonster.Nemuriko]: ({ targetState }) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return; // no monster to target
    immobiliseCard(targetState.monsterZones[targetIdx] as OccupiedMonsterZone);
  },
  [ManualEffectMonster.RevivalJam]: ({ originatorState }) => {
    specialSummon(originatorState, Monster.RevivalJam, { isLocked: true });
  },
  [ManualEffectMonster.FiendsHand]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    destroyHighestAtk(targetState);
    destroySelf(originatorState, monsterIdx);
  },
  [ManualEffectMonster.DarkNecrofear]: ({
    originatorState,
    targetState,
    activeField,
  }) => {
    convertMonster(originatorState, targetState);
  },
  [ManualEffectMonster.ToadMaster]: ({ originatorState }) => {
    specialSummon(originatorState, Monster.FrogTheJam);
  },
  [ManualEffectMonster.XHeadCannon]: ({ originatorState }, monsterIdx) => {
    // TODO
  },
  [ManualEffectMonster.FireReaper]: burn_Wrapped(50),
  [ManualEffectMonster.Doron]: ({ originatorState }) => {
    specialSummon(originatorState, Monster.Doron, { isLocked: true });
  },
  [ManualEffectMonster.TrapMaster]: ({ originatorState }) => {
    try {
      const spellIdx = getFirstEmptyZoneIdx(originatorState.spellTrapZones);
      originatorState.spellTrapZones[spellIdx] = {
        isOccupied: true,
        orientation: Orientation.FaceDown,
        card: getCard(Trap.AcidTrapHole) as SpellOrTrapOrRitualCard,
      };
    } catch {
      // no free spell zone
    }
  },
  [ManualEffectMonster.HourglassOfLife]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      () => true,
      (z) => z.permPowerUpLevel++
    );
  },
  [ManualEffectMonster.ObeliskTheTormentor]: ({ targetState }) => {
    destroyRow(targetState, FieldRow.OpponentMonster);
    burn(targetState, 4000);
  },
  [ManualEffectMonster.TheWingedDragonOfRaBattleMode]: ({
    originatorState,
    targetState,
  }) => {
    const dmg = originatorState.lp - 1;
    burn(originatorState, dmg);
    burn(targetState, dmg);
  },
  [ManualEffectMonster.RocketWarrior]: ({ targetState }) => {
    powerDownHighestAtk(targetState);
  },
  [ManualEffectMonster.BeastkingOfTheSwamps]: destroyRows([
    FieldRow.PlayerMonster,
    FieldRow.OpponentMonster,
  ]),
  [ManualEffectMonster.FairysGift]: heal_Wrapped(1000),
  [ManualEffectMonster.MonsterTamer]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.name === Monster.DungeonWorm,
      (z) => z.permPowerUpLevel++
    );
  },
  [ManualEffectMonster.MysticLamp]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    directAttack(originatorState, targetState, monsterIdx);
  },
  [ManualEffectMonster.Leghul]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    directAttack(originatorState, targetState, monsterIdx);
  },
  [ManualEffectMonster.GammaTheMagnetWarrior]: magnetWarriorMergeAttempt,
  [ManualEffectMonster.MonsterEye]: ({ targetState }) => {
    setRowFaceUp(targetState.hand);
  },
  [ManualEffectMonster.TheWingedDragonOfRaPhoenixMode]: ({
    originatorState,
    targetState,
  }) => {
    burn(originatorState, 1000);
    destroyRow(targetState, FieldRow.OpponentMonster);
  },
  [ManualEffectMonster.GoddessOfWhim]: ({ originatorState }, monsterIdx) => {
    draw(originatorState);
    destroySelf(originatorState, monsterIdx);
  },
  [ManualEffectMonster.DragonSeeker]: destroyMonsterType("Dragon"),
  [ManualEffectMonster.PenguinTorpedo]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    directAttack(originatorState, targetState, monsterIdx);
  },
  [ManualEffectMonster.ZombyraTheDark]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    destroyHighestAtk(targetState);
    permPowerDown(originatorState, monsterIdx);
  },
  [ManualEffectMonster.SpiritOfTheMountain]: setField_Wrapped(Field.Mountain),
  [ManualEffectMonster.AncientLamp]: ({ originatorState }) => {
    specialSummon(originatorState, Monster.LaJinnTheMysticalGenieOfTheLamp);
  },
  [ManualEffectMonster.Skelengel]: draw_Wrapped(),
  [ManualEffectMonster.KingsKnight]: ({ originatorState }) => {
    if (!containsCard(originatorState.monsterZones, Monster.QueensKnight)) {
      return;
    }
    specialSummon(originatorState, Monster.JacksKnight);
  },
  [ManualEffectMonster.YDragonHead]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    // TODO
  },
  [ManualEffectMonster.ZMetalTank]: ({ originatorState }) => {
    // TODO
  },
  [ManualEffectMonster.XYDragonCannon]: ({ originatorState }, monsterIdx) => {
    // TODO
    // destroy a face-up spell or trap on the foe's field by discarding the far left card in the own hand.
    // see xyz
  },
  [ManualEffectMonster.XZTankCannon]: ({ originatorState, targetState }) => {
    // TODO
    // destroy a face-down spell or trap on the foe's field by discarding the far left card in the own hand.
    // see xyz
  },
  [ManualEffectMonster.YZTankDragon]: ({ originatorState, targetState }) => {
    // TODO
    // destroy a face-down monster on the foe's field by discarding the far left card in the own hand.
    // see xyz
  },
  [ManualEffectMonster.ElectricLizard]: ({ targetState }) => {
    const monsterIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    immobiliseCard(targetState.monsterZones[monsterIdx] as OccupiedMonsterZone);
  },
  [ManualEffectMonster.LadyOfFaith]: heal_Wrapped(500),
  [ManualEffectMonster.ByserShock]: ({ originatorState, targetState }) => {
    // return all face-down cards on both fields to
    // the hands of both players if there is space in the hands
    const returnRowToHand =
      (duellist: Duellist, row: FieldRow) => (z: Zone, idx: number) => {
        if (!z.isOccupied) return;
        returnCardToHand(duellist, [row, idx as FieldCol]);
      };

    originatorState.monsterZones.forEach(
      returnRowToHand(originatorState, FieldRow.PlayerMonster)
    );
    originatorState.monsterZones.forEach(
      returnRowToHand(originatorState, FieldRow.PlayerSpellTrap)
    );
    targetState.monsterZones.forEach(
      returnRowToHand(targetState, FieldRow.OpponentMonster)
    );
    targetState.monsterZones.forEach(
      returnRowToHand(targetState, FieldRow.OpponentSpellTrap)
    );
  },
  [ManualEffectMonster.PuppetMaster]: ({ originatorState }) => {
    if (originatorState.graveyard !== Monster.Gernia) return;
    specialSummon(originatorState, Monster.DarkNecrofear);
    specialSummon(originatorState, Monster.HeadlessKnight);
    specialSummon(originatorState, Monster.Gernia);
    burn(originatorState, 1000);
  },
  [ManualEffectMonster.DarkPaladin]: ({ originatorState, targetState }) => {
    // TODO
    // destroy a spell on the opponent's field by discarding the far left card in the own hand
    // doesn't discard if no spells are found/destroyed
    // destroyLeftMostCard(originatorState, FieldRow.PlayerHand);
  },
  [ManualEffectMonster.Trent]: setField_Wrapped(Field.Forest),
  [ManualEffectMonster.BerserkDragon]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    // attack all enemy monsters from left to right in a single action
    targetState.monsterZones.forEach((z, idx) => {
      if (
        !z.isOccupied ||
        !originatorState.monsterZones[monsterIdx].isOccupied
      ) {
        // don't attack if Berserk Dragon itself has been destroyed
        return;
      }
      attackMonster(originatorState, targetState, monsterIdx, idx as FieldCol);
    });
  },
  [ManualEffectMonster.DesVolstgalph]: ({ targetState }) => {
    destroyHighestAtk(targetState);
    burn(targetState, 500);
  },
  [ManualEffectMonster.GilfordTheLightning]: destroyRows([
    FieldRow.OpponentMonster,
  ]),
  [ManualEffectMonster.MysticalBeastSerket]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return;
    destroyAtCoords(targetState, [FieldRow.OpponentMonster, targetIdx]);
    permPowerUp(originatorState, monsterIdx);
  },
  [ManualEffectMonster.CyberHarpie]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.name === Monster.HarpiesPetDragon,
      (z) => z.permPowerUpLevel++
    );
  },
  [ManualEffectMonster.ExarionUniverse]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    directAttack(originatorState, targetState, monsterIdx);
    permPowerDown(originatorState, monsterIdx);
  },
  [ManualEffectMonster.LegendaryFiend]: ({ originatorState }, monsterIdx) => {
    permPowerUp(originatorState, monsterIdx);
  },
  [ManualEffectMonster.ValkyrionTheMagnaWarrior]: (
    { originatorState },
    monsterIdx
  ) => {
    // separate into Alpha, Beta, and Gamma if there are two or more open spaces
    const numFreeZones = originatorState.monsterZones.filter(
      (z) => !z.isOccupied
    ).length;
    if (numFreeZones < 2) return; // separation fails
    clearZone(originatorState.monsterZones, monsterIdx);
    specialSummon(originatorState, Monster.AlphaTheMagnetWarrior, {
      isLocked: true,
    });
    specialSummon(originatorState, Monster.BetaTheMagnetWarrior, {
      isLocked: true,
    });
    specialSummon(originatorState, Monster.GammaTheMagnetWarrior, {
      isLocked: true,
    });
  },
  [ManualEffectMonster.FGD]: destroyRows([
    FieldRow.OpponentMonster,
    FieldRow.OpponentSpellTrap,
  ]),
  [ManualEffectMonster.RedArcheryGirl]: ({ targetState }) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return; // no monster to target
    permPowerDown(targetState, targetIdx);
    immobiliseCard(targetState.monsterZones[targetIdx] as OccupiedMonsterZone);
  },
  [ManualEffectMonster.Relinquished]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return; // no monsters to consume

    subsumeMonster(originatorState, targetState, monsterIdx, targetIdx);
  },
  [ManualEffectMonster.ThousandEyesRestrict]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return; // no monsters to consume

    subsumeMonster(originatorState, targetState, monsterIdx, targetIdx);
    permPowerUp(originatorState, monsterIdx, 2);
  },
  [ManualEffectMonster.AlphaTheMagnetWarrior]: magnetWarriorMergeAttempt,
  [ManualEffectMonster.InvitationToADarkSleep]: ({ targetState }) => {
    immobiliseRow(targetState.monsterZones);
  },
  [ManualEffectMonster.BarrelDragon]: ({ targetState }) => {
    // select up to 3 (random, occupied) enemy monster idxs
    const idxsToTarget = shuffle(
      targetState.monsterZones.reduce((arr, z, idx) => {
        if (!z.isOccupied) return arr;
        return [...arr, idx as FieldCol];
      }, [] as FieldCol[])
    ).slice(0, 3);

    // each targeted monster has a 50% chance to be destroyed
    idxsToTarget.forEach((i) => {
      if (Math.random() > 0.5) return;
      destroyAtCoords(targetState, [FieldRow.OpponentMonster, i]);
    });
  },
  [ManualEffectMonster.ReflectBounder]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return;
    const { card } = targetState.monsterZones[targetIdx] as OccupiedMonsterZone;
    burn(targetState, card.atk);
    destroySelf(originatorState, monsterIdx);
  },
  [ManualEffectMonster.BetaTheMagnetWarrior]: magnetWarriorMergeAttempt,
  [ManualEffectMonster.ParasiteParacide]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return;

    subsumeMonster(targetState, originatorState, targetIdx, monsterIdx);
  },
  [ManualEffectMonster.SkullMarkLadyBug]: ({ originatorState }, monsterIdx) => {
    heal(originatorState, 500);
    destroySelf(originatorState, monsterIdx);
  },
  [ManualEffectMonster.PinchHopper]: ({ originatorState }, monsterIdx) => {
    // For its own demise, it can summon (the strongest) insect from the own hand
    destroySelf(originatorState, monsterIdx);

    const handIdx = getHighestAtkZoneIdx(
      originatorState.hand,
      (z: OccupiedZone) => isType(z, "Insect")
    );
    if (handIdx === -1) return; // no insect to summon
    const { card } = originatorState.hand[handIdx] as OccupiedZone;
    specialSummon(originatorState, card.name);

    clearZone(originatorState.hand, handIdx);
  },
  [ManualEffectMonster.ChironTheMage]: destroyHighestAtk_Wrapped(),
  [ManualEffectMonster.BeastOfGilfer]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    updateMatchesInRow(
      targetState.monsterZones,
      () => true,
      (z: OccupiedMonsterZone) => z.permPowerUpLevel--
    );
    destroySelf(originatorState, monsterIdx);
  },
};

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
  DuellistKey,
  Field,
  ManualEffectMonster,
  Monster,
  Orientation,
  RowKey,
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
  [Monster.MysticalElf]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.name === Monster.BlueEyesWhiteDragon,
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.FlameSwordsman]: destroyMonsterType("Dinosaur"),
  [Monster.TimeWizard]: ({ originatorState }) => {
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
  [Monster.BattleOx]: destroyMonsterAlignment("Fire"),
  [Monster.CurseOfDragon]: setField_Wrapped(Field.Wasteland),
  [Monster.IllusionistFacelessMage]: ({ targetState }) => {
    immobiliseRow(targetState.monsterZones);
  },
  [Monster.HarpieLady]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.name === Monster.HarpiesPetDragon,
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.HarpieLadySisters]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.name === Monster.HarpiesPetDragon,
      (z) => (z.permPowerUpLevel += 2)
    );
  },
  [Monster.KairyuShin]: setField_Wrapped(Field.Umi),
  [Monster.GiantSoldierOfStone]: setField_Wrapped(Field.Arena),
  [Monster.ReaperOfTheCards]: ({ targetState }) => {
    clearFirstTrap(targetState);
  },
  [Monster.CatapultTurtle]: ({ originatorState, targetState }, monsterIdx) => {
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
      destroyAtCoords(originatorState, [RowKey.Monster, idx])
    );
    burn(targetState, combinedAtk);
  },
  [Monster.GyakutennoMegami]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z: OccupiedMonsterZone) => z.card.atk <= 500,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++
    );
  },
  [Monster.SpiritOfTheBooks]: ({ originatorState }) => {
    specialSummon(originatorState, Monster.BooKoo);
  },
  [Monster.XYZDragonCannon]: ({ originatorState, targetState }) => {
    // TODO
    // destroy a monster on the opponent's field by discarding the far left card in the own hand
    // left-most card in hand is discarded, if no cards, no penalty
  },
  [Monster.Nemuriko]: ({ targetState }) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return; // no monster to target
    immobiliseCard(targetState.monsterZones[targetIdx] as OccupiedMonsterZone);
  },
  [Monster.RevivalJam]: ({ originatorState }) => {
    specialSummon(originatorState, Monster.RevivalJam, { isLocked: true });
  },
  [Monster.FiendsHand]: ({ originatorState, targetState }, monsterIdx) => {
    destroyHighestAtk(targetState);
    destroySelf(originatorState, monsterIdx);
  },
  [Monster.DarkNecrofear]: ({ originatorState, targetState, activeField }) => {
    convertMonster(originatorState, targetState);
  },
  [Monster.ToadMaster]: ({ originatorState }) => {
    specialSummon(originatorState, Monster.FrogTheJam);
  },
  [Monster.XHeadCannon]: ({ originatorState }, monsterIdx) => {
    // TODO
  },
  [Monster.FireReaper]: burn_Wrapped(50),
  [Monster.Doron]: ({ originatorState }) => {
    specialSummon(originatorState, Monster.Doron, { isLocked: true });
  },
  [Monster.TrapMaster]: ({ originatorState }) => {
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
  [Monster.HourglassOfLife]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      () => true,
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.ObeliskTheTormentor]: ({ targetState }) => {
    destroyRow(targetState, RowKey.Monster);
    burn(targetState, 4000);
  },
  [Monster.TheWingedDragonOfRaBattleMode]: ({
    originatorState,
    targetState,
  }) => {
    const dmg = originatorState.lp - 1;
    burn(originatorState, dmg);
    burn(targetState, dmg);
  },
  [Monster.RocketWarrior]: ({ targetState }) => {
    powerDownHighestAtk(targetState);
  },
  [Monster.BeastkingOfTheSwamps]: destroyRows([
    [DuellistKey.Player, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.Monster],
  ]),
  [Monster.FairysGift]: heal_Wrapped(1000),
  [Monster.MonsterTamer]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.name === Monster.DungeonWorm,
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.MysticLamp]: ({ originatorState, targetState }, monsterIdx) => {
    directAttack(originatorState, targetState, monsterIdx);
  },
  [Monster.Leghul]: ({ originatorState, targetState }, monsterIdx) => {
    directAttack(originatorState, targetState, monsterIdx);
  },
  [Monster.GammaTheMagnetWarrior]: magnetWarriorMergeAttempt,
  [Monster.MonsterEye]: ({ targetState }) => {
    setRowFaceUp(targetState.hand);
  },
  [Monster.TheWingedDragonOfRaPhoenixMode]: ({
    originatorState,
    targetState,
  }) => {
    burn(originatorState, 1000);
    destroyRow(targetState, RowKey.Monster);
  },
  [Monster.GoddessOfWhim]: ({ originatorState }, monsterIdx) => {
    draw(originatorState);
    destroySelf(originatorState, monsterIdx);
  },
  [Monster.DragonSeeker]: destroyMonsterType("Dragon"),
  [Monster.PenguinTorpedo]: ({ originatorState, targetState }, monsterIdx) => {
    directAttack(originatorState, targetState, monsterIdx);
  },
  [Monster.ZombyraTheDark]: ({ originatorState, targetState }, monsterIdx) => {
    destroyHighestAtk(targetState);
    permPowerDown(originatorState, monsterIdx);
  },
  [Monster.SpiritOfTheMountain]: setField_Wrapped(Field.Mountain),
  [Monster.AncientLamp]: ({ originatorState }) => {
    specialSummon(originatorState, Monster.LaJinnTheMysticalGenieOfTheLamp);
  },
  [Monster.Skelengel]: draw_Wrapped(),
  [Monster.KingsKnight]: ({ originatorState }) => {
    if (!containsCard(originatorState.monsterZones, Monster.QueensKnight)) {
      return;
    }
    specialSummon(originatorState, Monster.JacksKnight);
  },
  [Monster.YDragonHead]: ({ originatorState, targetState }, monsterIdx) => {
    // TODO
  },
  [Monster.ZMetalTank]: ({ originatorState }) => {
    // TODO
  },
  [Monster.XYDragonCannon]: ({ originatorState }, monsterIdx) => {
    // TODO
    // destroy a face-up spell or trap on the foe's field by discarding the far left card in the own hand.
    // see xyz
  },
  [Monster.XZTankCannon]: ({ originatorState, targetState }) => {
    // TODO
    // destroy a face-down spell or trap on the foe's field by discarding the far left card in the own hand.
    // see xyz
  },
  [Monster.YZTankDragon]: ({ originatorState, targetState }) => {
    // TODO
    // destroy a face-down monster on the foe's field by discarding the far left card in the own hand.
    // see xyz
  },
  [Monster.ElectricLizard]: ({ targetState }) => {
    const monsterIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    immobiliseCard(targetState.monsterZones[monsterIdx] as OccupiedMonsterZone);
  },
  [Monster.LadyOfFaith]: heal_Wrapped(500),
  [Monster.ByserShock]: ({ originatorState, targetState }) => {
    // return all face-down cards on both fields to
    // the hands of both players if there is space in the hands
    const returnRowToHand =
      (duellist: Duellist, row: RowKey) => (z: Zone, idx: number) => {
        if (!z.isOccupied) return;
        returnCardToHand(duellist, [row, idx as FieldCol]);
      };

    originatorState.monsterZones.forEach(
      returnRowToHand(originatorState, RowKey.Monster)
    );
    originatorState.monsterZones.forEach(
      returnRowToHand(originatorState, RowKey.SpellTrap)
    );
    targetState.monsterZones.forEach(
      returnRowToHand(targetState, RowKey.Monster)
    );
    targetState.monsterZones.forEach(
      returnRowToHand(targetState, RowKey.SpellTrap)
    );
  },
  [Monster.PuppetMaster]: ({ originatorState }) => {
    if (originatorState.graveyard !== Monster.Gernia) return;
    specialSummon(originatorState, Monster.DarkNecrofear);
    specialSummon(originatorState, Monster.HeadlessKnight);
    specialSummon(originatorState, Monster.Gernia);
    burn(originatorState, 1000);
  },
  [Monster.DarkPaladin]: ({ originatorState, targetState }) => {
    // TODO
    // destroy a spell on the opponent's field by discarding the far left card in the own hand
    // doesn't discard if no spells are found/destroyed
    // destroyLeftMostCard(originatorState, FieldRow.PlayerHand);
  },
  [Monster.Trent]: setField_Wrapped(Field.Forest),
  [Monster.BerserkDragon]: ({ originatorState, targetState }, monsterIdx) => {
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
  [Monster.DesVolstgalph]: ({ targetState }) => {
    destroyHighestAtk(targetState);
    burn(targetState, 500);
  },
  [Monster.GilfordTheLightning]: destroyRows([
    [DuellistKey.Opponent, RowKey.Monster],
  ]),
  [Monster.MysticalBeastSerket]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return;
    destroyAtCoords(targetState, [RowKey.Monster, targetIdx]);
    permPowerUp(originatorState, monsterIdx);
  },
  [Monster.CyberHarpie]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.name === Monster.HarpiesPetDragon,
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.ExarionUniverse]: ({ originatorState, targetState }, monsterIdx) => {
    directAttack(originatorState, targetState, monsterIdx);
    permPowerDown(originatorState, monsterIdx);
  },
  [Monster.LegendaryFiend]: ({ originatorState }, monsterIdx) => {
    permPowerUp(originatorState, monsterIdx);
  },
  [Monster.ValkyrionTheMagnaWarrior]: ({ originatorState }, monsterIdx) => {
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
  [Monster.FGD]: destroyRows([
    [DuellistKey.Opponent, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.SpellTrap],
  ]),
  [Monster.RedArcheryGirl]: ({ targetState }) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return; // no monster to target
    permPowerDown(targetState, targetIdx);
    immobiliseCard(targetState.monsterZones[targetIdx] as OccupiedMonsterZone);
  },
  [Monster.Relinquished]: ({ originatorState, targetState }, monsterIdx) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return; // no monsters to consume

    subsumeMonster(originatorState, targetState, monsterIdx, targetIdx);
  },
  [Monster.ThousandEyesRestrict]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return; // no monsters to consume

    subsumeMonster(originatorState, targetState, monsterIdx, targetIdx);
    permPowerUp(originatorState, monsterIdx, 2);
  },
  [Monster.AlphaTheMagnetWarrior]: magnetWarriorMergeAttempt,
  [Monster.InvitationToADarkSleep]: ({ targetState }) => {
    immobiliseRow(targetState.monsterZones);
  },
  [Monster.BarrelDragon]: ({ targetState }) => {
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
      destroyAtCoords(targetState, [RowKey.Monster, i]);
    });
  },
  [Monster.ReflectBounder]: ({ originatorState, targetState }, monsterIdx) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return;
    const { card } = targetState.monsterZones[targetIdx] as OccupiedMonsterZone;
    burn(targetState, card.atk);
    destroySelf(originatorState, monsterIdx);
  },
  [Monster.BetaTheMagnetWarrior]: magnetWarriorMergeAttempt,
  [Monster.ParasiteParacide]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return;

    subsumeMonster(targetState, originatorState, targetIdx, monsterIdx);
  },
  [Monster.SkullMarkLadyBug]: ({ originatorState }, monsterIdx) => {
    heal(originatorState, 500);
    destroySelf(originatorState, monsterIdx);
  },
  [Monster.PinchHopper]: ({ originatorState }, monsterIdx) => {
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
  [Monster.ChironTheMage]: destroyHighestAtk_Wrapped(),
  [Monster.BeastOfGilfer]: ({ originatorState, targetState }, monsterIdx) => {
    updateMatchesInRow(
      targetState.monsterZones,
      () => true,
      (z: OccupiedMonsterZone) => z.permPowerUpLevel--
    );
    destroySelf(originatorState, monsterIdx);
  },
};

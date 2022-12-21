import {
  attackMonster,
  burn,
  clearFirstTrap,
  clearZone,
  convertMonster,
  destroyAtCoords,
  destroyHighestAtk,
  destroyRow,
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
  burnOther,
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
import { StateMap, ZoneCoordsMap } from "./duelSlice";
import {
  containsCard,
  getCard,
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
  isSpecificMonster,
  isType,
  shuffle,
} from "./duelUtil";

type MonsterManualEffectReducer = (
  state: StateMap,
  coordsMap: ZoneCoordsMap
) => void;

type MonsterManualEffectReducers = {
  [key in ManualEffectMonster]: MonsterManualEffectReducer;
};

export const monsterEffectReducers: MonsterManualEffectReducers = {
  [Monster.MysticalElf]: ({ state }, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z) => isSpecificMonster(z, Monster.BlueEyesWhiteDragon),
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.FlameSwordsman]: destroyMonsterType("Dinosaur"),
  [Monster.TimeWizard]: ({ state }, { ownMonsters }) => {
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
  [Monster.IllusionistFacelessMage]: ({ targetState }) => {
    immobiliseRow(targetState.monsterZones);
  },
  [Monster.HarpieLady]: ({ state }, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z) => isSpecificMonster(z, Monster.HarpiesPetDragon),
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.HarpieLadySisters]: ({ state }, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z) => isSpecificMonster(z, Monster.HarpiesPetDragon),
      (z) => (z.permPowerUpLevel += 2)
    );
  },
  [Monster.KairyuShin]: setField_Wrapped(Field.Umi),
  [Monster.GiantSoldierOfStone]: setField_Wrapped(Field.Arena),
  [Monster.ReaperOfTheCards]: ({ state }, { otherDKey }) => {
    clearFirstTrap(state, otherDKey);
  },
  [Monster.CatapultTurtle]: (
    { state, originatorState },
    { ownMonsters, otherDKey, colIdx: monsterIdx }
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
    idxsToClear.forEach((idx) => destroyAtCoords(state, [...ownMonsters, idx]));
    burn(state, otherDKey, combinedAtk);
  },
  [Monster.GyakutennoMegami]: ({ state }, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z: OccupiedMonsterZone) => z.card.atk <= 500,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++
    );
  },
  [Monster.SpiritOfTheBooks]: ({ state }, { dKey }) => {
    specialSummon(state, dKey, Monster.BooKoo);
  },
  [Monster.XYZDragonCannon]: ({ originatorState, targetState }) => {
    // TODO
    // destroy a monster on the opponent's field by discarding the far left card in the own hand
    // left-most card in hand is discarded, if no cards, no penalty
  },
  [Monster.Nemuriko]: ({ state, targetState }, { otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return; // no monster to target
    immobiliseCard(targetState.monsterZones[targetIdx] as OccupiedMonsterZone);
  },
  [Monster.RevivalJam]: ({ state }, { dKey }) => {
    specialSummon(state, dKey, Monster.RevivalJam, { isLocked: true });
  },
  [Monster.FiendsHand]: ({ state }, { otherDKey, zoneCoords }) => {
    destroyHighestAtk(state, otherDKey);
    destroyAtCoords(state, zoneCoords);
  },
  [Monster.DarkNecrofear]: ({ state }, { dKey }) => {
    convertMonster(state, dKey);
  },
  [Monster.ToadMaster]: ({ state }, { dKey }) => {
    specialSummon(state, dKey, Monster.FrogTheJam);
  },
  [Monster.XHeadCannon]: ({ originatorState }, { zoneCoords }) => {
    // TODO
  },
  [Monster.FireReaper]: burnOther(50),
  [Monster.Doron]: ({ state }, { dKey }) => {
    specialSummon(state, dKey, Monster.Doron, { isLocked: true });
  },
  [Monster.TrapMaster]: ({ state, originatorState }, { ownSpellTrap }) => {
    try {
      const spellIdx = getFirstEmptyZoneIdx(state, ownSpellTrap);
      originatorState.spellTrapZones[spellIdx] = {
        isOccupied: true,
        orientation: Orientation.FaceDown,
        card: getCard(Trap.AcidTrapHole) as SpellOrTrapOrRitualCard,
      };
    } catch {
      // no free spell zone
    }
  },
  [Monster.HourglassOfLife]: ({ state }, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      () => true,
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.ObeliskTheTormentor]: ({ state }, { otherMonsters, otherDKey }) => {
    destroyRow(state, otherMonsters);
    burn(state, otherDKey, 4000);
  },
  [Monster.TheWingedDragonOfRaBattleMode]: (
    { state, originatorState },
    { dKey, otherDKey }
  ) => {
    const dmg = originatorState.lp - 1;
    burn(state, dKey, dmg);
    burn(state, otherDKey, dmg);
  },
  [Monster.RocketWarrior]: ({ state }, { dKey }) => {
    powerDownHighestAtk(state, dKey);
  },
  [Monster.BeastkingOfTheSwamps]: destroyRows([
    [DuellistKey.Player, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.Monster],
  ]),
  [Monster.FairysGift]: heal_Wrapped(1000),
  [Monster.MonsterTamer]: ({ state }, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z) => isSpecificMonster(z, Monster.DungeonWorm),
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.MysticLamp]: (
    { originatorState, targetState },
    { colIdx: monsterIdx }
  ) => {
    directAttack(originatorState, targetState, monsterIdx);
  },
  [Monster.Leghul]: (
    { originatorState, targetState },
    { colIdx: monsterIdx }
  ) => {
    directAttack(originatorState, targetState, monsterIdx);
  },
  [Monster.GammaTheMagnetWarrior]: ({ state }, { zoneCoords }) => {
    magnetWarriorMergeAttempt(state, zoneCoords);
  },
  [Monster.MonsterEye]: ({ state }, { otherHand }) => {
    setRowFaceUp(state, otherHand);
  },
  [Monster.TheWingedDragonOfRaPhoenixMode]: (
    { state },
    { dKey, otherMonsters }
  ) => {
    burn(state, dKey, 1000);
    destroyRow(state, otherMonsters);
  },
  [Monster.GoddessOfWhim]: ({ state }, { dKey, zoneCoords }) => {
    draw(state, dKey);
    destroyAtCoords(state, zoneCoords);
  },
  [Monster.DragonSeeker]: destroyMonsterType("Dragon"),
  [Monster.PenguinTorpedo]: (
    { originatorState, targetState },
    { colIdx: monsterIdx }
  ) => {
    directAttack(originatorState, targetState, monsterIdx);
  },
  [Monster.ZombyraTheDark]: ({ state }, { zoneCoords, otherDKey }) => {
    destroyHighestAtk(state, otherDKey);
    permPowerDown(state, zoneCoords);
  },
  [Monster.SpiritOfTheMountain]: setField_Wrapped(Field.Mountain),
  [Monster.AncientLamp]: ({ state }, { dKey }) => {
    specialSummon(state, dKey, Monster.LaJinnTheMysticalGenieOfTheLamp);
  },
  [Monster.Skelengel]: draw_Wrapped(),
  [Monster.KingsKnight]: ({ state }, { dKey, ownMonsters }) => {
    if (!containsCard(state, ownMonsters, Monster.QueensKnight)) {
      return;
    }
    specialSummon(state, dKey, Monster.JacksKnight);
  },
  [Monster.YDragonHead]: ({ originatorState, targetState }, monsterIdx) => {
    // TODO
  },
  [Monster.ZMetalTank]: ({ originatorState }) => {
    // TODO
  },
  [Monster.XYDragonCannon]: ({ originatorState }, { zoneCoords }) => {
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
  [Monster.ElectricLizard]: ({ state, targetState }, { otherMonsters }) => {
    const monsterIdx = getHighestAtkZoneIdx(state, otherMonsters);
    immobiliseCard(targetState.monsterZones[monsterIdx] as OccupiedMonsterZone);
  },
  [Monster.LadyOfFaith]: heal_Wrapped(500),
  [Monster.ByserShock]: (
    { state, originatorState, targetState },
    { ownMonsters, otherMonsters, ownSpellTrap, otherSpellTrap }
  ) => {
    // return all face-down cards on both fields to
    // the hands of both players if there is space in the hands
    const returnRowToHand =
      (rowCoords: RowCoords) => (z: Zone, idx: number) => {
        if (!z.isOccupied) return;
        returnCardToHand(state, [...rowCoords, idx as FieldCol]);
      };

    originatorState.monsterZones.forEach(returnRowToHand(ownMonsters));
    originatorState.monsterZones.forEach(returnRowToHand(ownSpellTrap));
    targetState.monsterZones.forEach(returnRowToHand(otherMonsters));
    targetState.monsterZones.forEach(returnRowToHand(otherSpellTrap));
  },
  [Monster.PuppetMaster]: ({ originatorState, state }, { dKey, otherDKey }) => {
    if (originatorState.graveyard !== Monster.Gernia) return;
    specialSummon(state, dKey, Monster.DarkNecrofear);
    specialSummon(state, dKey, Monster.HeadlessKnight);
    specialSummon(state, dKey, Monster.Gernia);
    burn(state, otherDKey, 1000);
  },
  [Monster.DarkPaladin]: ({ state }, { ownHand }) => {
    // TODO
    // destroy a spell on the opponent's field by discarding the far left card in the own hand
    // doesn't discard if no spells are found/destroyed
    // destroyFirstFound(state, ownHand);
  },
  [Monster.Trent]: setField_Wrapped(Field.Forest),
  [Monster.BerserkDragon]: (
    { state, originatorState, targetState },
    { colIdx: monsterIdx, otherMonsters, zoneCoords }
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
      attackMonster(state, zoneCoords, [...otherMonsters, idx as FieldCol]);
    });
  },
  [Monster.DesVolstgalph]: ({ state }, { otherDKey }) => {
    destroyHighestAtk(state, otherDKey);
    burn(state, otherDKey, 500);
  },
  [Monster.GilfordTheLightning]: destroyRows([
    [DuellistKey.Opponent, RowKey.Monster],
  ]),
  [Monster.MysticalBeastSerket]: ({ state }, { otherMonsters, zoneCoords }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return;
    destroyAtCoords(state, [...otherMonsters, targetIdx]);
    permPowerUp(state, zoneCoords);
  },
  [Monster.CyberHarpie]: ({ state }, { ownMonsters }) => {
    updateMatchesInRow(
      state,
      ownMonsters,
      (z) => isSpecificMonster(z, Monster.HarpiesPetDragon),
      (z) => z.permPowerUpLevel++
    );
  },
  [Monster.ExarionUniverse]: (
    { state, originatorState, targetState },
    { colIdx: monsterIdx, zoneCoords }
  ) => {
    directAttack(originatorState, targetState, monsterIdx);
    permPowerDown(state, zoneCoords);
  },
  [Monster.LegendaryFiend]: ({ state }, { zoneCoords }) => {
    permPowerUp(state, zoneCoords);
  },
  [Monster.ValkyrionTheMagnaWarrior]: (
    { state, originatorState },
    { dKey, zoneCoords }
  ) => {
    // separate into Alpha, Beta, and Gamma if there are two or more open spaces
    const numFreeZones = originatorState.monsterZones.filter(
      (z) => !z.isOccupied
    ).length;
    if (numFreeZones < 2) return; // separation fails
    clearZone(state, zoneCoords);
    specialSummon(state, dKey, Monster.AlphaTheMagnetWarrior, {
      isLocked: true,
    });
    specialSummon(state, dKey, Monster.BetaTheMagnetWarrior, {
      isLocked: true,
    });
    specialSummon(state, dKey, Monster.GammaTheMagnetWarrior, {
      isLocked: true,
    });
  },
  [Monster.FGD]: destroyRows([
    [DuellistKey.Opponent, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.SpellTrap],
  ]),
  [Monster.RedArcheryGirl]: ({ state, targetState }, { otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return; // no monster to target
    permPowerDown(state, [...otherMonsters, targetIdx]);
    immobiliseCard(targetState.monsterZones[targetIdx] as OccupiedMonsterZone);
  },
  [Monster.Relinquished]: ({ state }, { zoneCoords, otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return; // no monsters to consume

    subsumeMonster(state, zoneCoords, [...otherMonsters, targetIdx]);
  },
  [Monster.ThousandEyesRestrict]: (
    { state },
    { zoneCoords, otherMonsters }
  ) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return; // no monsters to consume

    subsumeMonster(state, zoneCoords, [...otherMonsters, targetIdx]);
    permPowerUp(state, zoneCoords, 2);
  },
  [Monster.AlphaTheMagnetWarrior]: ({ state }, { zoneCoords }) => {
    magnetWarriorMergeAttempt(state, zoneCoords);
  },
  [Monster.InvitationToADarkSleep]: ({ targetState }) => {
    immobiliseRow(targetState.monsterZones);
  },
  [Monster.BarrelDragon]: ({ state, targetState }, { otherMonsters }) => {
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
      destroyAtCoords(state, [...otherMonsters, i]);
    });
  },
  [Monster.ReflectBounder]: (
    { state, targetState },
    { otherMonsters, otherDKey, zoneCoords }
  ) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return;
    const { card } = targetState.monsterZones[targetIdx] as OccupiedMonsterZone;
    burn(state, otherDKey, card.atk);
    destroyAtCoords(state, zoneCoords);
  },
  [Monster.BetaTheMagnetWarrior]: ({ state }, { zoneCoords }) => {
    magnetWarriorMergeAttempt(state, zoneCoords);
  },
  [Monster.ParasiteParacide]: ({ state }, { zoneCoords, otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return;

    subsumeMonster(state, [...otherMonsters, targetIdx], zoneCoords);
  },
  [Monster.SkullMarkLadyBug]: ({ state }, { dKey, zoneCoords }) => {
    heal(state, dKey, 500);
    destroyAtCoords(state, zoneCoords);
  },
  [Monster.PinchHopper]: (
    { state, originatorState },
    { zoneCoords, ownHand, dKey }
  ) => {
    // For its own demise, it can summon (the strongest) insect from the own hand
    destroyAtCoords(state, zoneCoords);

    const handIdx = getHighestAtkZoneIdx(state, ownHand, (z: OccupiedZone) =>
      isType(z, "Insect")
    );
    if (handIdx === -1) return; // no insect to summon
    const { card } = originatorState.hand[handIdx] as OccupiedZone;
    specialSummon(state, dKey, card.name);

    clearZone(state, [...ownHand, handIdx]);
  },
  [Monster.ChironTheMage]: destroyHighestAtk_Wrapped(),
  [Monster.BeastOfGilfer]: ({ state }, { zoneCoords, otherMonsters }) => {
    updateMatchesInRow(
      state,
      otherMonsters,
      () => true,
      (z: OccupiedMonsterZone) => z.permPowerUpLevel--
    );
    destroyAtCoords(state, zoneCoords);
  },
};

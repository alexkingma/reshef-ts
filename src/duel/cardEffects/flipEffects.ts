import { DuellistKey, Field, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { FlipEffectMonster } from "../enums/monster_v1.0";
import { Trap } from "../enums/spellTrapRitual_v1.0";
import { isInsect } from "../util/cardTypeUtil";
import { shuffle } from "../util/common";
import { draw } from "../util/deckUtil";
import { burn, heal } from "../util/duellistUtil";
import { graveyardContainsCards } from "../util/graveyardUtil";
import {
  clearFirstTrap,
  countMatchesInRow,
  destroyFirstFound,
  destroyHighestAtk,
  destroyRow,
  getHighestAtkZoneIdx,
  getRow,
  hasMatchInRow,
  immobiliseRow,
  powerDownHighestAtk,
  rowContainsAnyCards,
  setRowFaceUp,
  updateMonsters,
} from "../util/rowUtil";
import {
  burnOther,
  destroyHighestAtk as destroyHighestAtk_Wrapped,
  destroyMonsterAlignment,
  destroyMonsterType,
  destroyRows,
  directAttack as directAttack_Wrapped,
  draw as draw_Wrapped,
  healSelf as heal_Wrapped,
  setOwnField,
} from "../util/wrappedUtil";
import {
  attackMonster,
  clearZone,
  convertMonster,
  destroyAtCoords,
  directAttack,
  getZone,
  immobiliseCard,
  isFaceDown,
  isFaceUp,
  isNotGodCard,
  isOccupied,
  isSpecificMonster,
  isSpell,
  magnetWarriorMergeAttempt,
  permPowerDown,
  permPowerUp,
  returnCardToHand,
  setSpellTrap,
  specialSummon,
  subsumeMonster,
  transformMonster,
  xyzMergeAttempt,
} from "../util/zoneUtil";

export const flipEffectReducers: CardReducerMap<
  FlipEffectMonster,
  DirectEffectReducer
> = {
  // destroy opponent cards
  [Monster.FlameSwordsman]: destroyMonsterType("Dinosaur"),
  [Monster.DragonSeeker]: destroyMonsterType("Dragon"),
  [Monster.BattleOx]: destroyMonsterAlignment("Fire"),
  [Monster.FiendsHand]: (state, { otherDKey, zoneCoords }) => {
    destroyHighestAtk(state, otherDKey);
    destroyAtCoords(state, zoneCoords);
  },
  [Monster.ObeliskTheTormentor]: (state, { otherMonsters, otherDKey }) => {
    destroyRow(state, otherMonsters);
    burn(state, otherDKey, 4000);
  },
  [Monster.BeastkingOfTheSwamps]: destroyRows([
    [DuellistKey.Player, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.Monster],
  ]),
  [Monster.TheWingedDragonOfRaPhoenixMode]: (
    state,
    { dKey, otherMonsters }
  ) => {
    burn(state, dKey, 1000);
    destroyRow(state, otherMonsters);
  },
  [Monster.ZombyraTheDark]: (state, { zoneCoords, otherDKey }) => {
    destroyHighestAtk(state, otherDKey);
    permPowerDown(state, zoneCoords, 500, 500);
  },
  [Monster.DesVolstgalph]: (state, { otherDKey }) => {
    destroyHighestAtk(state, otherDKey);
    burn(state, otherDKey, 500);
  },
  [Monster.GilfordTheLightning]: destroyRows([
    [DuellistKey.Opponent, RowKey.Monster],
  ]),
  [Monster.MysticalBeastSerket]: (state, { otherMonsters, zoneCoords }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters, isNotGodCard);
    if (targetIdx === -1) return;
    destroyAtCoords(state, [...otherMonsters, targetIdx]);
    permPowerUp(state, zoneCoords, 500, 500);
  },
  [Monster.FGD]: destroyRows([
    [DuellistKey.Opponent, RowKey.Monster],
    [DuellistKey.Opponent, RowKey.SpellTrap],
  ]),
  [Monster.BarrelDragon]: (state, { otherDKey, otherMonsters }) => {
    // select up to 3 (random, occupied) enemy monster idxs
    const idxsToTarget = shuffle(
      state[otherDKey].monsterZones.reduce((arr, z, idx) => {
        if (!isOccupied(z)) return arr;
        return [...arr, idx];
      }, [] as number[])
    ).slice(0, 3);

    // each targeted monster has a 50% chance to be destroyed
    idxsToTarget.forEach((i) => {
      if (Math.random() > 0.5) return;
      destroyAtCoords(state, [...otherMonsters, i]);
    });
  },
  [Monster.ChironTheMage]: destroyHighestAtk_Wrapped(),
  [Monster.ReaperOfTheCards]: (state, { otherDKey }) => {
    clearFirstTrap(state, otherDKey);
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
  [Monster.DarkPaladin]: (state, { ownHand, otherSpellTrap }) => {
    // destroy a [spell] by discarding from hand
    if (!hasMatchInRow(state, otherSpellTrap, isSpell)) return;
    destroyFirstFound(state, ownHand);
    destroyFirstFound(state, otherSpellTrap, isSpell);
  },

  // field
  [Monster.CurseOfDragon]: setOwnField(Field.Wasteland),
  [Monster.KairyuShin]: setOwnField(Field.Umi),
  [Monster.GiantSoldierOfStone]: setOwnField(Field.Arena),
  [Monster.SpiritOfTheMountain]: setOwnField(Field.Mountain),
  [Monster.Trent]: setOwnField(Field.Forest),

  // special summon
  [Monster.SpiritOfTheBooks]: (state, { dKey }) => {
    specialSummon(state, dKey, Monster.BooKoo);
  },
  [Monster.RevivalJam]: (state, { dKey }) => {
    specialSummon(state, dKey, Monster.RevivalJam, { isLocked: true });
  },
  [Monster.ToadMaster]: (state, { dKey }) => {
    specialSummon(state, dKey, Monster.FrogTheJam);
  },
  [Monster.Doron]: (state, { dKey }) => {
    specialSummon(state, dKey, Monster.Doron, { isLocked: true });
  },
  [Monster.AncientLamp]: (state, { dKey }) => {
    specialSummon(state, dKey, Monster.LaJinnTheMysticalGenieOfTheLamp);
  },
  [Monster.KingsKnight]: (state, { dKey, ownMonsters }) => {
    if (!rowContainsAnyCards(state, ownMonsters, Monster.QueensKnight)) {
      return;
    }
    specialSummon(state, dKey, Monster.JacksKnight);
  },
  [Monster.PuppetMaster]: (state, { dKey, otherDKey }) => {
    if (!graveyardContainsCards(state, dKey, Monster.Gernia)) return;
    specialSummon(state, dKey, Monster.DarkNecrofear);
    specialSummon(state, dKey, Monster.HeadlessKnight);
    specialSummon(state, dKey, Monster.Gernia);
    burn(state, otherDKey, 1000);
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
  [Monster.PinchHopper]: (state, { zoneCoords, ownHand, dKey }) => {
    // For its own demise, it can summon (the strongest) insect from the own hand
    destroyAtCoords(state, zoneCoords);

    const handIdx = getHighestAtkZoneIdx(state, ownHand, isInsect);
    if (handIdx === -1) return; // no insect to summon
    const z = getZone(state, [...ownHand, handIdx]);
    specialSummon(state, dKey, z.id);

    clearZone(state, [...ownHand, handIdx]);
  },

  // powerup/upgrade own monsters
  [Monster.TimeWizard]: (state, { ownMonsters }) => {
    updateMonsters(
      state,
      ownMonsters,
      (z) => transformMonster(z, Monster.DarkSage),
      (z) => isSpecificMonster(z, Monster.DarkMagician)
    );
    updateMonsters(
      state,
      ownMonsters,
      (z) => transformMonster(z, Monster.ThousandDragon),
      (z) => isSpecificMonster(z, Monster.BabyDragon)
    );
  },
  [Monster.GyakutennoMegami]: (state, { ownMonsters }) => {
    updateMonsters(
      state,
      ownMonsters,
      (z: OccupiedMonsterZone) => {
        z.permPowerUpAtk += 500;
        z.permPowerUpDef += 500;
      },
      (z: OccupiedMonsterZone) => z.effAtk <= 500
    );
  },
  [Monster.HourglassOfLife]: (state, { dKey, ownMonsters }) => {
    burn(state, dKey, 1000);
    updateMonsters(state, ownMonsters, (z) => {
      z.permPowerUpAtk += 500;
      z.permPowerUpDef += 500;
    });
  },
  [Monster.LegendaryFiend]: (state, { zoneCoords }) => {
    permPowerUp(state, zoneCoords, 500, 500);
  },

  // immobilise opponent
  [Monster.IllusionistFacelessMage]: (state, { otherMonsters }) => {
    immobiliseRow(state, otherMonsters);
  },
  [Monster.Nemuriko]: (state, { otherMonsters }) => {
    immobiliseRow(state, otherMonsters);
  },
  [Monster.ElectricLizard]: (state, { otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return;
    immobiliseCard(state, [...otherMonsters, targetIdx]);
  },
  [Monster.RedArcheryGirl]: (state, { otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return;
    permPowerDown(state, [...otherMonsters, targetIdx], 500, 500);
    immobiliseCard(state, [...otherMonsters, targetIdx]);
  },
  [Monster.InvitationToADarkSleep]: (state, { otherMonsters }) => {
    immobiliseRow(state, otherMonsters);
  },

  // heal self
  [Monster.FairysGift]: heal_Wrapped(1000),
  [Monster.LadyOfFaith]: heal_Wrapped(500),
  [Monster.SkullMarkLadyBug]: (state, { dKey, zoneCoords }) => {
    heal(state, dKey, 500);
    destroyAtCoords(state, zoneCoords);
  },

  // burn/direct attack
  [Monster.FireReaper]: burnOther(50),
  [Monster.MysticLamp]: directAttack_Wrapped,
  [Monster.Leghul]: directAttack_Wrapped,
  [Monster.PenguinTorpedo]: directAttack_Wrapped,
  [Monster.ExarionUniverse]: (state, { zoneCoords }) => {
    directAttack(state, zoneCoords);
    permPowerDown(state, zoneCoords, 500, 500);
  },
  [Monster.TheWingedDragonOfRaBattleMode]: (state, { dKey, otherDKey }) => {
    const dmg = state[dKey].lp - 1;
    burn(state, dKey, dmg);
    burn(state, otherDKey, dmg);
  },
  [Monster.ReflectBounder]: (
    state,
    { otherMonsters, otherDKey, zoneCoords }
  ) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
    if (targetIdx === -1) return;
    const z = getZone(state, [
      ...otherMonsters,
      targetIdx,
    ]) as OccupiedMonsterZone;
    burn(state, otherDKey, z.effAtk);
    destroyAtCoords(state, zoneCoords);
  },

  // control/subsume opponent monster
  [Monster.DarkNecrofear]: (state, { dKey }) => {
    convertMonster(state, dKey);
  },
  [Monster.Relinquished]: (state, { zoneCoords, otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters, isNotGodCard);
    if (targetIdx === -1) return; // no monsters to consume

    subsumeMonster(state, zoneCoords, [...otherMonsters, targetIdx]);
  },
  [Monster.ThousandEyesRestrict]: (state, { zoneCoords, otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters, isNotGodCard);
    if (targetIdx === -1) return; // no monsters to consume

    subsumeMonster(state, zoneCoords, [...otherMonsters, targetIdx]);
    permPowerUp(state, zoneCoords, 1000, 1000);
  },
  [Monster.ParasiteParacide]: (state, { zoneCoords, otherMonsters }) => {
    const targetIdx = getHighestAtkZoneIdx(state, otherMonsters, isNotGodCard);
    if (targetIdx === -1) return;

    subsumeMonster(state, [...otherMonsters, targetIdx], zoneCoords);
  },

  // merge with own monsters
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
  [Monster.AlphaTheMagnetWarrior]: (state, { zoneCoords }) => {
    magnetWarriorMergeAttempt(state, zoneCoords);
  },
  [Monster.BetaTheMagnetWarrior]: (state, { zoneCoords }) => {
    magnetWarriorMergeAttempt(state, zoneCoords);
  },
  [Monster.GammaTheMagnetWarrior]: (state, { zoneCoords }) => {
    magnetWarriorMergeAttempt(state, zoneCoords);
  },

  // assorted
  [Monster.CatapultTurtle]: (
    state,
    { dKey, ownMonsters, otherDKey, colIdx: monsterIdx }
  ) => {
    // make all the unused monsters on the player's
    // field disappear and hit the foe with their combined power
    const idxsToClear: number[] = [];
    let combinedAtk = 0;
    state[dKey].monsterZones.forEach((z, idx) => {
      if (!isOccupied(z) || z.isLocked || idx === monsterIdx) return;
      idxsToClear.push(idx);
      combinedAtk += z.effAtk;
    });
    idxsToClear.forEach((idx) => destroyAtCoords(state, [...ownMonsters, idx]));
    burn(state, otherDKey, combinedAtk);
  },
  [Monster.TrapMaster]: (state, { dKey }) => {
    setSpellTrap(state, dKey, Trap.AcidTrapHole);
  },
  [Monster.RocketWarrior]: (state, { dKey }) => {
    powerDownHighestAtk(state, dKey);
  },
  [Monster.MonsterEye]: (state, { otherHand }) => {
    setRowFaceUp(state, otherHand);
  },
  [Monster.GoddessOfWhim]: (state, { dKey, zoneCoords }) => {
    draw(state, dKey);
    destroyAtCoords(state, zoneCoords);
  },
  [Monster.Skelengel]: draw_Wrapped(),
  [Monster.ByserShock]: (
    state,
    { ownMonsters, otherMonsters, ownSpellTrap, otherSpellTrap }
  ) => {
    // return all face-down cards on both fields to
    // the hands of both players if there is space in the hands
    const returnRowToHand = (rowCoords: RowCoords) => {
      getRow(state, rowCoords).forEach((z, i) => {
        if (!isOccupied(z)) return;
        returnCardToHand(state, [...rowCoords, i]);
      });
    };

    returnRowToHand(ownMonsters);
    returnRowToHand(ownSpellTrap);
    returnRowToHand(otherMonsters);
    returnRowToHand(otherSpellTrap);
  },
  [Monster.BerserkDragon]: (state, { otherMonsters, zoneCoords }) => {
    // attack all enemy monsters from left to right in a single action
    getRow(state, otherMonsters).forEach((z, idx) => {
      // must re-get zone on each iteration of loop in order to check if
      // Berserk Dragon has destroyed itself before completing all attacks
      const originZone = getZone(state, zoneCoords) as OccupiedMonsterZone;
      if (!isOccupied(z) || !isOccupied(originZone)) {
        // don't attack if Berserk Dragon itself has been destroyed
        return;
      }
      attackMonster(state, zoneCoords, [...otherMonsters, idx]);
    });
  },
  [Monster.BeastOfGilfer]: (state, { zoneCoords, otherMonsters }) => {
    updateMonsters(state, otherMonsters, (z: OccupiedMonsterZone) => {
      z.permPowerUpAtk -= 500;
      z.permPowerUpDef -= 500;
    });
    destroyAtCoords(state, zoneCoords);
  },
};

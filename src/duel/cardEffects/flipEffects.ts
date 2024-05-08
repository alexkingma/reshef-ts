import { DuellistKey, Field, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { Trap } from "../enums/spellTrapRitual";
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
  immobiliseZone,
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

export const flipEffects: CardEffectMap<DirectEffectReducer> = {
  // destroy opponent cards
  [Monster.FlameSwordsman]: {
    dialogue: "TODO",
    effect: destroyMonsterType("Dinosaur"),
  },
  [Monster.DragonSeeker]: {
    dialogue: "TODO",
    effect: destroyMonsterType("Dragon"),
  },
  [Monster.BattleOx]: {
    dialogue: "TODO",
    effect: destroyMonsterAlignment("Fire"),
  },
  [Monster.FiendsHand]: {
    dialogue: "TODO",
    effect: (state, { otherDKey, zoneCoords }) => {
      destroyHighestAtk(state, otherDKey);
      destroyAtCoords(state, zoneCoords);
    },
  },
  [Monster.ObeliskTheTormentor]: {
    dialogue: "TODO",
    effect: (state, { otherMonsters, otherDKey }) => {
      destroyRow(state, otherMonsters);
      burn(state, otherDKey, 4000);
    },
  },
  [Monster.BeastkingOfTheSwamps]: {
    dialogue: "TODO",
    effect: destroyRows([
      [DuellistKey.Player, RowKey.Monster],
      [DuellistKey.Opponent, RowKey.Monster],
    ]),
  },
  [Monster.TheWingedDragonOfRaPhoenixMode]: {
    dialogue: "TODO",
    effect: (state, { dKey, otherMonsters }) => {
      burn(state, dKey, 1000);
      destroyRow(state, otherMonsters);
    },
  },
  [Monster.ZombyraTheDark]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords, otherDKey }) => {
      destroyHighestAtk(state, otherDKey);
      permPowerDown(state, zoneCoords, 500, 500);
    },
  },
  [Monster.DesVolstgalph]: {
    dialogue: "TODO",
    effect: (state, { otherDKey }) => {
      destroyHighestAtk(state, otherDKey);
      burn(state, otherDKey, 500);
    },
  },
  [Monster.GilfordTheLightning]: {
    dialogue: "TODO",
    effect: destroyRows([[DuellistKey.Opponent, RowKey.Monster]]),
  },
  [Monster.MysticalBeastSerket]: {
    dialogue: "TODO",
    effect: (state, { otherMonsters, zoneCoords }) => {
      const targetIdx = getHighestAtkZoneIdx(
        state,
        otherMonsters,
        isNotGodCard
      );
      if (targetIdx === -1) return;
      destroyAtCoords(state, [...otherMonsters, targetIdx]);
      permPowerUp(state, zoneCoords, 500, 500);
    },
  },
  [Monster.FGD]: {
    dialogue: "TODO",
    effect: destroyRows([
      [DuellistKey.Opponent, RowKey.Monster],
      [DuellistKey.Opponent, RowKey.SpellTrap],
    ]),
  },
  [Monster.BarrelDragon]: {
    dialogue: "TODO",
    effect: (state, { otherDKey, otherMonsters }) => {
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
  },
  [Monster.ChironTheMage]: {
    dialogue: "TODO",
    effect: destroyHighestAtk_Wrapped(),
  },
  [Monster.ReaperOfTheCards]: {
    dialogue: "TODO",
    effect: (state, { otherDKey }) => {
      clearFirstTrap(state, otherDKey);
    },
  },
  [Monster.XYDragonCannon]: {
    dialogue: "TODO",
    effect: (state, { otherSpellTrap, ownHand }) => {
      // destroy a [face-up spell/trap] by discarding from hand
      if (!hasMatchInRow(state, otherSpellTrap, isFaceUp)) return;
      destroyFirstFound(state, ownHand);
      destroyFirstFound(state, otherSpellTrap, isFaceUp);
    },
  },
  [Monster.XZTankCannon]: {
    dialogue: "TODO",
    effect: (state, { otherSpellTrap, ownHand }) => {
      // destroy a [face-down spell/trap] by discarding from hand
      if (!hasMatchInRow(state, otherSpellTrap, isFaceDown)) return;
      destroyFirstFound(state, ownHand);
      destroyFirstFound(state, otherSpellTrap, isFaceDown);
    },
  },
  [Monster.YZTankDragon]: {
    dialogue: "TODO",
    effect: (state, { otherDKey, otherMonsters, ownHand }) => {
      // destroy a [face-down monster] by discarding from hand
      if (!hasMatchInRow(state, otherMonsters, isFaceDown)) return;
      destroyFirstFound(state, ownHand);
      destroyHighestAtk(state, otherDKey, isFaceDown);
    },
  },
  [Monster.XYZDragonCannon]: {
    dialogue: "TODO",
    effect: (state, { otherDKey, otherMonsters, ownHand }) => {
      // destroy [any monster] by discarding from hand
      if (!hasMatchInRow(state, otherMonsters)) return;
      destroyFirstFound(state, ownHand);
      destroyHighestAtk(state, otherDKey);
    },
  },
  [Monster.DarkPaladin]: {
    dialogue: "TODO",
    effect: (state, { ownHand, otherSpellTrap }) => {
      // destroy a [spell] by discarding from hand
      if (!hasMatchInRow(state, otherSpellTrap, isSpell)) return;
      destroyFirstFound(state, ownHand);
      destroyFirstFound(state, otherSpellTrap, isSpell);
    },
  },

  // field
  [Monster.CurseOfDragon]: {
    dialogue: "TODO",
    effect: setOwnField(Field.Wasteland),
  },
  [Monster.KairyuShin]: {
    dialogue: "TODO",
    effect: setOwnField(Field.Umi),
  },
  [Monster.GiantSoldierOfStone]: {
    dialogue: "TODO",
    effect: setOwnField(Field.Arena),
  },
  [Monster.SpiritOfTheMountain]: {
    dialogue: "TODO",
    effect: setOwnField(Field.Mountain),
  },
  [Monster.Trent]: {
    dialogue: "TODO",
    effect: setOwnField(Field.Forest),
  },

  // special summon
  [Monster.SpiritOfTheBooks]: {
    dialogue: "TODO",
    effect: (state, { dKey }) => {
      specialSummon(state, dKey, Monster.BooKoo);
    },
  },
  [Monster.RevivalJam]: {
    dialogue: "TODO",
    effect: (state, { dKey }) => {
      specialSummon(state, dKey, Monster.RevivalJam, { isLocked: true });
    },
  },
  [Monster.ToadMaster]: {
    dialogue: "TODO",
    effect: (state, { dKey }) => {
      specialSummon(state, dKey, Monster.FrogTheJam);
    },
  },
  [Monster.Doron]: {
    dialogue: "TODO",
    effect: (state, { dKey }) => {
      specialSummon(state, dKey, Monster.Doron, { isLocked: true });
    },
  },
  [Monster.AncientLamp]: {
    dialogue: "TODO",
    effect: (state, { dKey }) => {
      specialSummon(state, dKey, Monster.LaJinnTheMysticalGenieOfTheLamp);
    },
  },
  [Monster.KingsKnight]: {
    dialogue: "TODO",
    effect: (state, { dKey, ownMonsters }) => {
      if (!rowContainsAnyCards(state, ownMonsters, Monster.QueensKnight)) {
        return;
      }
      specialSummon(state, dKey, Monster.JacksKnight);
    },
  },
  [Monster.PuppetMaster]: {
    dialogue: "TODO",
    effect: (state, { dKey, otherDKey }) => {
      if (!graveyardContainsCards(state, dKey, Monster.Gernia)) return;
      specialSummon(state, dKey, Monster.DarkNecrofear);
      specialSummon(state, dKey, Monster.HeadlessKnight);
      specialSummon(state, dKey, Monster.Gernia);
      burn(state, otherDKey, 1000);
    },
  },
  [Monster.ValkyrionTheMagnaWarrior]: {
    dialogue: "TODO",
    effect: (state, { dKey, zoneCoords, ownMonsters }) => {
      // separate into Alpha, Beta, and Gamma if there are two or more open spaces
      const numFreeZones = 5 - countMatchesInRow(state, ownMonsters);
      if (numFreeZones < 2) return; // separation fails
      const isLocked = { isLocked: true };
      clearZone(state, zoneCoords);
      specialSummon(state, dKey, Monster.AlphaTheMagnetWarrior, isLocked);
      specialSummon(state, dKey, Monster.BetaTheMagnetWarrior, isLocked);
      specialSummon(state, dKey, Monster.GammaTheMagnetWarrior, isLocked);
    },
  },
  [Monster.PinchHopper]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords, ownHand, dKey }) => {
      // For its own demise, it can summon (the strongest) insect from the own hand
      destroyAtCoords(state, zoneCoords);

      const handIdx = getHighestAtkZoneIdx(state, ownHand, isInsect);
      if (handIdx === -1) return; // no insect to summon
      const z = getZone(state, [...ownHand, handIdx]);
      specialSummon(state, dKey, z.id);

      clearZone(state, [...ownHand, handIdx]);
    },
  },

  // powerup/upgrade own monsters
  [Monster.TimeWizard]: {
    dialogue: "TODO",
    effect: (state, { ownMonsters }) => {
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
  },
  [Monster.GyakutennoMegami]: {
    dialogue: "TODO",
    effect: (state, { ownMonsters }) => {
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
  },
  [Monster.HourglassOfLife]: {
    dialogue: "TODO",
    effect: (state, { dKey, ownMonsters }) => {
      burn(state, dKey, 1000);
      updateMonsters(state, ownMonsters, (z) => {
        z.permPowerUpAtk += 500;
        z.permPowerUpDef += 500;
      });
    },
  },
  [Monster.LegendaryFiend]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords }) => {
      permPowerUp(state, zoneCoords, 500, 500);
    },
  },

  // immobilise opponent
  [Monster.IllusionistFacelessMage]: {
    dialogue: "TODO",
    effect: (state, { otherMonsters }) => {
      immobiliseRow(state, otherMonsters);
    },
  },
  [Monster.Nemuriko]: {
    dialogue: "TODO",
    effect: (state, { otherMonsters }) => {
      immobiliseRow(state, otherMonsters);
    },
  },
  [Monster.ElectricLizard]: {
    dialogue: "TODO",
    effect: (state, { otherMonsters }) => {
      const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
      if (targetIdx === -1) return;
      const z = getZone(state, [
        ...otherMonsters,
        targetIdx,
      ]) as OccupiedMonsterZone;
      immobiliseZone(z);
    },
  },
  [Monster.RedArcheryGirl]: {
    dialogue: "TODO",
    effect: (state, { otherMonsters }) => {
      const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
      if (targetIdx === -1) return;
      const z = getZone(state, [
        ...otherMonsters,
        targetIdx,
      ]) as OccupiedMonsterZone;
      permPowerDown(state, [...otherMonsters, targetIdx], 500, 500);
      immobiliseZone(z);
    },
  },
  [Monster.InvitationToADarkSleep]: {
    dialogue: "TODO",
    effect: (state, { otherMonsters }) => {
      immobiliseRow(state, otherMonsters);
    },
  },

  // heal self
  [Monster.FairysGift]: {
    dialogue: "TODO",
    effect: heal_Wrapped(1000),
  },
  [Monster.LadyOfFaith]: {
    dialogue: "TODO",
    effect: heal_Wrapped(500),
  },
  [Monster.SkullMarkLadyBug]: {
    dialogue: "TODO",
    effect: (state, { dKey, zoneCoords }) => {
      heal(state, dKey, 500);
      destroyAtCoords(state, zoneCoords);
    },
  },

  // burn/direct attack
  [Monster.FireReaper]: {
    dialogue: "TODO",
    effect: burnOther(50),
  },
  [Monster.MysticLamp]: {
    dialogue: "TODO",
    effect: directAttack_Wrapped,
  },
  [Monster.Leghul]: {
    dialogue: "TODO",
    effect: directAttack_Wrapped,
  },
  [Monster.PenguinTorpedo]: {
    dialogue: "TODO",
    effect: directAttack_Wrapped,
  },
  [Monster.ExarionUniverse]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords }) => {
      directAttack(state, zoneCoords);
      permPowerDown(state, zoneCoords, 500, 500);
    },
  },
  [Monster.TheWingedDragonOfRaBattleMode]: {
    dialogue: "TODO",
    effect: (state, { dKey, otherDKey }) => {
      const dmg = state[dKey].lp - 1;
      burn(state, dKey, dmg);
      burn(state, otherDKey, dmg);
    },
  },
  [Monster.ReflectBounder]: {
    dialogue: "TODO",
    effect: (state, { otherMonsters, otherDKey, zoneCoords }) => {
      const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
      if (targetIdx === -1) return;
      const z = getZone(state, [
        ...otherMonsters,
        targetIdx,
      ]) as OccupiedMonsterZone;
      burn(state, otherDKey, z.effAtk);
      destroyAtCoords(state, zoneCoords);
    },
  },

  // control/subsume opponent monster
  [Monster.DarkNecrofear]: {
    dialogue: "TODO",
    effect: (state, { dKey }) => {
      convertMonster(state, dKey);
    },
  },
  [Monster.Relinquished]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords, otherMonsters }) => {
      const targetIdx = getHighestAtkZoneIdx(
        state,
        otherMonsters,
        isNotGodCard
      );
      if (targetIdx === -1) return; // no monsters to consume

      subsumeMonster(state, zoneCoords, [...otherMonsters, targetIdx]);
    },
  },
  [Monster.ThousandEyesRestrict]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords, otherMonsters }) => {
      const targetIdx = getHighestAtkZoneIdx(
        state,
        otherMonsters,
        isNotGodCard
      );
      if (targetIdx === -1) return; // no monsters to consume

      subsumeMonster(state, zoneCoords, [...otherMonsters, targetIdx]);
      permPowerUp(state, zoneCoords, 1000, 1000);
    },
  },
  [Monster.ParasiteParacide]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords, otherMonsters }) => {
      const targetIdx = getHighestAtkZoneIdx(
        state,
        otherMonsters,
        isNotGodCard
      );
      if (targetIdx === -1) return;

      subsumeMonster(state, [...otherMonsters, targetIdx], zoneCoords);
    },
  },

  // merge with own monsters
  [Monster.XHeadCannon]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords }) => {
      // note that x/y/z CANNOT merge with their "stage 2" counterparts
      // e.g. X cannot merge with YZ, only with individual Y and/or Z pieces
      xyzMergeAttempt(state, zoneCoords, [
        [[Monster.YDragonHead, Monster.ZMetalTank], Monster.XYZDragonCannon],
        [[Monster.YDragonHead], Monster.XYDragonCannon],
        [[Monster.ZMetalTank], Monster.XZTankCannon],
      ]);
    },
  },
  [Monster.YDragonHead]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords }) => {
      xyzMergeAttempt(state, zoneCoords, [
        [[Monster.XHeadCannon, Monster.ZMetalTank], Monster.XYZDragonCannon],
        [[Monster.XHeadCannon], Monster.XYDragonCannon],
        [[Monster.ZMetalTank], Monster.YZTankDragon],
      ]);
    },
  },
  [Monster.ZMetalTank]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords }) => {
      xyzMergeAttempt(state, zoneCoords, [
        [[Monster.XHeadCannon, Monster.YDragonHead], Monster.XYZDragonCannon],
        [[Monster.XHeadCannon], Monster.XZTankCannon],
        [[Monster.YDragonHead], Monster.YZTankDragon],
      ]);
    },
  },
  [Monster.AlphaTheMagnetWarrior]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords }) => {
      magnetWarriorMergeAttempt(state, zoneCoords);
    },
  },
  [Monster.BetaTheMagnetWarrior]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords }) => {
      magnetWarriorMergeAttempt(state, zoneCoords);
    },
  },
  [Monster.GammaTheMagnetWarrior]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords }) => {
      magnetWarriorMergeAttempt(state, zoneCoords);
    },
  },

  // assorted
  [Monster.CatapultTurtle]: {
    dialogue: "TODO",
    effect: (state, { dKey, ownMonsters, otherDKey, colIdx: monsterIdx }) => {
      // make all the unused monsters on the player's
      // field disappear and hit the foe with their combined power
      const idxsToClear: number[] = [];
      let combinedAtk = 0;
      state[dKey].monsterZones.forEach((z, idx) => {
        if (!isOccupied(z) || z.isLocked || idx === monsterIdx) return;
        idxsToClear.push(idx);
        combinedAtk += z.effAtk;
      });
      idxsToClear.forEach((idx) =>
        destroyAtCoords(state, [...ownMonsters, idx])
      );
      burn(state, otherDKey, combinedAtk);
    },
  },
  [Monster.TrapMaster]: {
    dialogue: "TODO",
    effect: (state, { dKey }) => {
      setSpellTrap(state, dKey, Trap.AcidTrapHole);
    },
  },
  [Monster.RocketWarrior]: {
    dialogue: "TODO",
    effect: (state, { dKey }) => {
      powerDownHighestAtk(state, dKey);
    },
  },
  [Monster.MonsterEye]: {
    dialogue: "TODO",
    effect: (state, { otherHand }) => {
      setRowFaceUp(state, otherHand);
    },
  },
  [Monster.GoddessOfWhim]: {
    dialogue: "TODO",
    effect: (state, { dKey, zoneCoords }) => {
      draw(state, dKey);
      destroyAtCoords(state, zoneCoords);
    },
  },
  [Monster.Skelengel]: {
    dialogue: "TODO",
    effect: draw_Wrapped(),
  },
  [Monster.ByserShock]: {
    dialogue: "TODO",
    effect: (
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
  },
  [Monster.BerserkDragon]: {
    dialogue: "TODO",
    effect: (state, { otherMonsters, zoneCoords }) => {
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
  },
  [Monster.BeastOfGilfer]: {
    dialogue: "TODO",
    effect: (state, { zoneCoords, otherMonsters }) => {
      updateMonsters(state, otherMonsters, (z: OccupiedMonsterZone) => {
        z.permPowerUpAtk -= 500;
        z.permPowerUpDef -= 500;
      });
      destroyAtCoords(state, zoneCoords);
    },
  },
};

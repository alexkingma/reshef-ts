import { CardTextPrefix as Pre } from "../enums/dialogue";
import { DKey, Field, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { Trap } from "../enums/spellTrapRitual";
import { isInsect } from "../util/cardTypeUtil";
import { always, shuffle } from "../util/common";
import { draw } from "../util/deckUtil";
import { burn, heal } from "../util/duellistUtil";
import { effect_DirectAttack } from "../util/effectsUtil";
import { graveyardContainsCards } from "../util/graveyardUtil";
import {
  clearFirstTrap,
  countMatchesInRow,
  destroyFirstFound,
  destroyHighestAtk,
  destroyRow,
  getRow,
  hasMatchInRow,
  immobiliseRow,
  onHighestAtkZone,
  powerDownHighestAtk,
  rowContainsCard,
  setRowFaceUp,
  updateMonsters,
} from "../util/rowUtil";
import {
  burnOther,
  destroyMonsterAlignment,
  destroyMonsterType,
  destroyRows,
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
  isEmpty,
  isFaceDown,
  isFaceUp,
  isNotGodCard,
  isSpecificMonster,
  isSpell,
  magnetWarriorMergeAttempt,
  permPowerDown,
  permPowerUp,
  returnCardToHand,
  setSpellTrap,
  specialSummon,
  subsumeMonster,
  transformZone,
  xyzMergeAttempt,
} from "../util/zoneUtil";

export const flipEffects: CardEffectMap<DirectEffectReducer> = {
  // destroy opponent cards
  [Monster.FlameSwordsman]: {
    text: `${Pre.Manual}Its circular slash will destroy all dinosaurs on the opponent's field.`,
    effect: destroyMonsterType("Dinosaur"),
  },
  [Monster.DragonSeeker]: {
    text: `${Pre.Manual}All the dragons on the opponent's field will be destroyed.`,
    effect: destroyMonsterType("Dragon"),
  },
  [Monster.BattleOx]: {
    text: `${Pre.Manual}Its Axe Crusher will destroy all fire monsters on the opponent's field.`,
    effect: destroyMonsterAlignment("Fire"),
  },
  [Monster.FiendsHand]: {
    text: `${Pre.Manual}One monster on the foe's field will be taken to the world of the dead.`,
    effect: (state, { otherDKey, zoneCoords }) => {
      destroyHighestAtk(state, otherDKey);
      destroyAtCoords(state, zoneCoords);
    },
  },
  [Monster.ObeliskTheTormentor]: {
    text: `${Pre.Manual}Every monster on the foe's field will be destroyed.\nThe opponent will be hit with 4,000LP damage.`,
    effect: (state, { otherMonsters, otherDKey }) => {
      destroyRow(state, otherMonsters);
      burn(state, otherDKey, 4000);
    },
  },
  [Monster.BeastkingOfTheSwamps]: {
    text: `${Pre.Manual}It will drown all monsters on the field in a swamp.`,
    effect: destroyRows([
      [DKey.Player, RowKey.Monster],
      [DKey.Opponent, RowKey.Monster],
    ]),
  },
  [Monster.TheWingedDragonOfRaPhoenixMode]: {
    text: `${Pre.Manual}All monsters on the foe's field will be wiped out at the cost of 1,000LP.`,
    effect: (state, { dKey, otherMonsters }) => {
      burn(state, dKey, 1000);
      destroyRow(state, otherMonsters);
    },
  },
  [Monster.ZombyraTheDark]: {
    text: `${Pre.Manual}In return for powereing down, a monster on the foe's field will be destroyed.`,
    effect: (state, { zoneCoords, otherDKey }) => {
      destroyHighestAtk(state, otherDKey);
      permPowerDown(state, zoneCoords, 500, 500);
    },
  },
  [Monster.DesVolstgalph]: {
    text: `${Pre.Manual}One monster on the foe's field will be destroyed.\nThe opponent will be hit with 500LP damage.`,
    effect: (state, { otherDKey }) => {
      destroyHighestAtk(state, otherDKey);
      burn(state, otherDKey, 500);
    },
  },
  [Monster.GilfordTheLightning]: {
    text: `${Pre.Manual}Every monster on the foe's field will be destroyed.`,
    effect: destroyRows([[DKey.Opponent, RowKey.Monster]]),
  },
  [Monster.MysticalBeastSerket]: {
    text: `${Pre.Manual}It will power up by enveloping one monster on the foe's field.`,
    effect: (state, { otherMonsters, zoneCoords }) => {
      onHighestAtkZone(state, otherMonsters, isNotGodCard, (_, coords) => {
        destroyAtCoords(state, coords);
        permPowerUp(state, zoneCoords, 500, 500);
      });
    },
  },
  [Monster.FGD]: {
    text: `${Pre.Manual}All monsters, spells, and traps on the opponent's field will be destroyed.`,
    effect: destroyRows([
      [DKey.Opponent, RowKey.Monster],
      [DKey.Opponent, RowKey.SpellTrap],
    ]),
  },
  [Monster.BarrelDragon]: {
    text: `${Pre.Manual}Up to three monsters on the foe's field will be wiped out at a 50% success rate.`,
    effect: (state, { otherMonsters }) => {
      // select up to 3 (random, occupied) enemy monster idxs
      const idxsToTarget = shuffle(
        getRow(state, otherMonsters).reduce((arr, z, idx) => {
          if (isEmpty(z)) return arr;
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
    text: `${Pre.Manual}A monster on the opponent's field will be destroyed.`,
    effect: (state, { otherDKey }) => {
      destroyHighestAtk(state, otherDKey);
    },
  },
  [Monster.ReaperOfTheCards]: {
    text: `${Pre.Manual}A trap on the foe's field will be destroyed.`,
    effect: (state, { otherDKey }) => {
      clearFirstTrap(state, otherDKey);
    },
  },
  [Monster.XYDragonCannon]: {
    text: `${Pre.Manual}Discard the card at the far left in your hand to destroy a face-up spell or trap on the opponent's field.`,
    effect: (state, { otherSpellTrap, ownHand }) => {
      // destroy a [face-up spell/trap] by discarding from hand
      if (!hasMatchInRow(state, otherSpellTrap, isFaceUp)) return;
      destroyFirstFound(state, ownHand);
      destroyFirstFound(state, otherSpellTrap, isFaceUp);
    },
  },
  [Monster.XZTankCannon]: {
    text: `${Pre.Manual}Discard the card at the far left in your hand to destroy a face-down spell or trap on the opponent's field.`,
    effect: (state, { otherSpellTrap, ownHand }) => {
      // destroy a [face-down spell/trap] by discarding from hand
      if (!hasMatchInRow(state, otherSpellTrap, isFaceDown)) return;
      destroyFirstFound(state, ownHand);
      destroyFirstFound(state, otherSpellTrap, isFaceDown);
    },
  },
  [Monster.YZTankDragon]: {
    text: `${Pre.Manual}Discard the card at the far left in your hand to destroy a face-down monster on the opponent's field.`,
    effect: (state, { otherDKey, otherMonsters, ownHand }) => {
      // destroy a [face-down monster] by discarding from hand
      if (!hasMatchInRow(state, otherMonsters, isFaceDown)) return;
      destroyFirstFound(state, ownHand);
      destroyHighestAtk(state, otherDKey, isFaceDown);
    },
  },
  [Monster.XYZDragonCannon]: {
    text: `${Pre.Manual}Discard the card at the far left in your hand to destroy a monster on the opponent's field.`,
    effect: (state, { otherDKey, otherMonsters, ownHand }) => {
      // destroy [any monster] by discarding from hand
      if (!hasMatchInRow(state, otherMonsters)) return;
      destroyFirstFound(state, ownHand);
      destroyHighestAtk(state, otherDKey);
    },
  },
  [Monster.DarkPaladin]: {
    text: `${Pre.Manual}Discard the card at the far left in your hand to destroy a spell on the opponent's field.`,
    effect: (state, { ownHand, otherSpellTrap }) => {
      // destroy a [spell] by discarding from hand
      if (!hasMatchInRow(state, otherSpellTrap, isSpell)) return;
      destroyFirstFound(state, ownHand);
      destroyFirstFound(state, otherSpellTrap, isSpell);
    },
  },

  // field
  [Monster.CurseOfDragon]: {
    text: `${Pre.Manual}The field will be turned into a wasteland.`,
    effect: setOwnField(Field.Wasteland),
  },
  [Monster.KairyuShin]: {
    text: `${Pre.Manual}The field will be turned into a sea.`,
    effect: setOwnField(Field.Umi),
  },
  [Monster.GiantSoldierOfStone]: {
    text: `${Pre.Manual}The field will be turned into an arena.`,
    effect: setOwnField(Field.Arena),
  },
  [Monster.SpiritOfTheMountain]: {
    text: `${Pre.Manual}The field will be turned into a mountain.`,
    effect: setOwnField(Field.Mountain),
  },
  [Monster.Trent]: {
    text: `${Pre.Manual}The field will be turned into a forest.`,
    effect: setOwnField(Field.Forest),
  },

  // special summon
  [Monster.SpiritOfTheBooks]: {
    text: `${Pre.Manual}Boo Koo will be summoned if there is room on the own field.`,
    effect: (state, { dKey }) => {
      specialSummon(state, dKey, Monster.BooKoo);
    },
  },
  [Monster.RevivalJam]: {
    text: `${Pre.Manual}Revival Jam will split if there is space on the player's field.`,
    effect: (state, { dKey }) => {
      specialSummon(state, dKey, Monster.RevivalJam, { isLocked: true });
    },
  },
  [Monster.ToadMaster]: {
    text: `${Pre.Manual}Frog the Jam will be summoned if there is room on the own field.`,
    effect: (state, { dKey }) => {
      specialSummon(state, dKey, Monster.FrogTheJam);
    },
  },
  [Monster.Doron]: {
    text: `${Pre.Manual}Doron will clone itself if there is room on the own field.`,
    effect: (state, { dKey }) => {
      specialSummon(state, dKey, Monster.Doron, { isLocked: true });
    },
  },
  [Monster.AncientLamp]: {
    text: `${Pre.Manual}La Jinn the Mystical Genie of the Lamp will be summoned if there is room on the own field.`,
    effect: (state, { dKey }) => {
      specialSummon(state, dKey, Monster.LaJinnTheMysticalGenieOfTheLamp);
    },
  },
  [Monster.KingsKnight]: {
    text: `${Pre.Manual}A Jack's Knight is summoned if a Queen's Knight is on the player's field.`,
    effect: (state, { dKey, ownMonsters }) => {
      if (!rowContainsCard(state, ownMonsters, Monster.QueensKnight)) return;
      specialSummon(state, dKey, Monster.JacksKnight);
    },
  },
  [Monster.PuppetMaster]: {
    text: `${Pre.Manual}Three zombies will be summoned in exchange for 1,000LP.`,
    effect: (state, { dKey, otherDKey }) => {
      if (!graveyardContainsCards(state, dKey, Monster.Gernia)) return;
      specialSummon(state, dKey, Monster.DarkNecrofear);
      specialSummon(state, dKey, Monster.HeadlessKnight);
      specialSummon(state, dKey, Monster.Gernia);
      burn(state, otherDKey, 1000);
    },
  },
  [Monster.ValkyrionTheMagnaWarrior]: {
    text: `${Pre.Manual}If there is room on the own field, it splits into Alpha, Beta, and Gamma.`,
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
    text: `${Pre.Sacrifice}In return, it summons an insect monster from the player's hand.`,
    effect: (state, { zoneCoords, ownHand, dKey }) => {
      destroyAtCoords(state, zoneCoords);

      onHighestAtkZone(state, ownHand, isInsect, (z, targetCoords) => {
        specialSummon(state, dKey, z.id);
        clearZone(state, targetCoords);
      });
    },
  },

  // powerup/upgrade own monsters
  [Monster.TimeWizard]: {
    text: `${Pre.Manual}Over a millennium, monsters are transformed.`,
    effect: (state, { ownMonsters }) => {
      updateMonsters(
        state,
        ownMonsters,
        (z) => transformZone(z, Monster.DarkSage),
        (z) => isSpecificMonster(z, Monster.DarkMagician)
      );
      updateMonsters(
        state,
        ownMonsters,
        (z) => transformZone(z, Monster.ThousandDragon),
        (z) => isSpecificMonster(z, Monster.BabyDragon)
      );
    },
  },
  [Monster.GyakutennoMegami]: {
    text: `${Pre.Manual}All monsters on the own field with 500 ATK or lower are powered up.`,
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
    text: `${Pre.Manual}All monsters on the own field will be powered up in exchange for 1,000LP.`,
    effect: (state, { dKey, ownMonsters }) => {
      burn(state, dKey, 1000);
      updateMonsters(state, ownMonsters, (z) => {
        z.permPowerUpAtk += 500;
        z.permPowerUpDef += 500;
      });
    },
  },
  [Monster.LegendaryFiend]: {
    text: `${Pre.Manual}Legendary Fiend will power up.`,
    effect: (state, { zoneCoords }) => {
      permPowerUp(state, zoneCoords, 500, 500);
    },
  },

  // immobilise opponent
  [Monster.IllusionistFacelessMage]: {
    text: `${Pre.Manual}Its illusory eye stops all monsters on the foe's field from moving on the next turn.`,
    effect: (state, { otherMonsters }) => {
      immobiliseRow(state, otherMonsters);
    },
  },
  [Monster.Nemuriko]: {
    text: `${Pre.Manual}All monsters on the foe's field will fall asleep.`,
    effect: (state, { otherMonsters }) => {
      immobiliseRow(state, otherMonsters);
    },
  },
  [Monster.ElectricLizard]: {
    text: `${Pre.Manual}One monster on the foe's field will be immobilised on the next turn.`,
    effect: (state, { otherMonsters }) => {
      onHighestAtkZone(state, otherMonsters, always, immobiliseZone);
    },
  },
  [Monster.RedArcheryGirl]: {
    text: `${Pre.Manual}A monster on the foe's field will be powered down and unable to move next turn.`,
    effect: (state, { otherMonsters }) => {
      onHighestAtkZone(state, otherMonsters, always, (z, targetCoords) => {
        permPowerDown(state, targetCoords, 500, 500);
        immobiliseZone(z);
      });
    },
  },
  [Monster.InvitationToADarkSleep]: {
    text: `${Pre.Manual}All monsters on the foe's field will fall asleep and be incapable of moving.`,
    effect: (state, { otherMonsters }) => {
      immobiliseRow(state, otherMonsters);
    },
  },

  // heal self
  [Monster.FairysGift]: {
    text: `${Pre.Manual}The player's LP will be restored by 1,000.`,
    effect: heal_Wrapped(1000),
  },
  [Monster.LadyOfFaith]: {
    text: `${Pre.Manual}The player's LP will be restored by 500.`,
    effect: heal_Wrapped(500),
  },
  [Monster.SkullMarkLadyBug]: {
    text: `${Pre.Sacrifice}In return, it restores the player's LP by 500.`,
    effect: (state, { dKey, zoneCoords }) => {
      heal(state, dKey, 500);
      destroyAtCoords(state, zoneCoords);
    },
  },

  // burn/direct attack
  [Monster.FireReaper]: {
    text: `${Pre.Manual}It will shoot a flaming arrow at the foe to inflict 50LP damage.`,
    effect: burnOther(50),
  },
  [Monster.MysticLamp]: effect_DirectAttack(),
  [Monster.Leghul]: effect_DirectAttack(),
  [Monster.PenguinTorpedo]: effect_DirectAttack(),
  [Monster.ExarionUniverse]: {
    text: `${Pre.Manual}It will inflict LP damage on the foe equal to its ATK, then power down.`,
    effect: (state, { zoneCoords }) => {
      directAttack(state, zoneCoords);
      permPowerDown(state, zoneCoords, 500, 500);
    },
  },
  [Monster.TheWingedDragonOfRaBattleMode]: {
    text: `${Pre.Manual}The player's LP was cut to 1. In return, the opponent loses an identical amount of LP.`,
    effect: (state, { dKey, otherDKey }) => {
      const dmg = state.duellists[dKey].lp - 1;
      burn(state, dKey, dmg);
      burn(state, otherDKey, dmg);
    },
  },
  [Monster.ReflectBounder]: {
    text: `${Pre.Sacrifice}In return, the ATK of a monster on the foe's field inflicts LP damage.`,
    effect: (state, { otherMonsters, otherDKey, zoneCoords }) => {
      onHighestAtkZone(state, otherMonsters, always, (z) => {
        burn(state, otherDKey, z.effAtk);
        destroyAtCoords(state, zoneCoords);
      });
    },
  },

  // control/subsume opponent monster
  [Monster.DarkNecrofear]: {
    text: `${Pre.Manual}A monster on the foe's field will be made an ally.`,
    effect: (state, { dKey }) => {
      convertMonster(state, dKey);
    },
  },
  [Monster.Relinquished]: {
    text: `${Pre.Manual}A monster on the foe's field will be robbed of its abilities.`,
    effect: (state, { zoneCoords, otherMonsters }) => {
      onHighestAtkZone(state, otherMonsters, always, (_, targetCoords) => {
        subsumeMonster(state, zoneCoords, targetCoords);
      });
    },
  },
  [Monster.ThousandEyesRestrict]: {
    text: `${Pre.Manual}The abilities of a foe will be stolen, and further powered up two levels.`,
    effect: (state, { zoneCoords, otherMonsters }) => {
      onHighestAtkZone(state, otherMonsters, always, (_, targetCoords) => {
        subsumeMonster(state, zoneCoords, targetCoords);
        permPowerUp(state, zoneCoords, 1000, 1000);
      });
    },
  },
  [Monster.ParasiteParacide]: {
    text: `${Pre.Manual}It infected a monster on the foe's field.`,
    effect: (state, { zoneCoords, otherMonsters }) => {
      onHighestAtkZone(state, otherMonsters, always, (_, targetCoords) => {
        // reverse subsume: force opp mon to be replaced with self
        subsumeMonster(state, targetCoords, zoneCoords);
      });
    },
  },

  // merge with own monsters
  [Monster.XHeadCannon]: {
    text: `${Pre.Manual}X will combine with Y and/or Z on the player's field.\nCombine with Y to become XY. Combine with Z to become XZ. Combine with Y and Z to become XYZ.`,
    effect: (state, { zoneCoords }) => {
      xyzMergeAttempt(state, zoneCoords, [
        [[Monster.YDragonHead, Monster.ZMetalTank], Monster.XYZDragonCannon],
        [[Monster.YDragonHead], Monster.XYDragonCannon],
        [[Monster.ZMetalTank], Monster.XZTankCannon],
      ]);
    },
  },
  [Monster.YDragonHead]: {
    text: `${Pre.Manual}Y will combine with X and/or Z on the player's field.\nCombine with X to become XY. Combine with Z to become YZ. Combine with X and Z to become XYZ.`,
    effect: (state, { zoneCoords }) => {
      xyzMergeAttempt(state, zoneCoords, [
        [[Monster.XHeadCannon, Monster.ZMetalTank], Monster.XYZDragonCannon],
        [[Monster.XHeadCannon], Monster.XYDragonCannon],
        [[Monster.ZMetalTank], Monster.YZTankDragon],
      ]);
    },
  },
  [Monster.ZMetalTank]: {
    text: `${Pre.Manual}Z will combine with X and/or Y on the player's field.\nCombine with X to become XZ. Combine with Y to become YZ. Combine with X and Z to become XYZ.`,
    effect: (state, { zoneCoords }) => {
      xyzMergeAttempt(state, zoneCoords, [
        [[Monster.XHeadCannon, Monster.YDragonHead], Monster.XYZDragonCannon],
        [[Monster.XHeadCannon], Monster.XZTankCannon],
        [[Monster.YDragonHead], Monster.YZTankDragon],
      ]);
    },
  },
  [Monster.AlphaTheMagnetWarrior]: {
    text: `${Pre.Manual}If Beta and Gamma are on the field, the trio integrates as one. Valkyrion the Magna Warrior will appear.`,
    effect: (state, { zoneCoords }) => {
      magnetWarriorMergeAttempt(state, zoneCoords);
    },
  },
  [Monster.BetaTheMagnetWarrior]: {
    text: `${Pre.Manual}If Alpha and Gamma are on the field, the trio integrates as one. Valkyrion the Magna Warrior will appear.`,
    effect: (state, { zoneCoords }) => {
      magnetWarriorMergeAttempt(state, zoneCoords);
    },
  },
  [Monster.GammaTheMagnetWarrior]: {
    text: `${Pre.Manual}If Alpha and Beta are on the field, the trio integrates as one. Valkyrion the Magna Warrior will appear.`,
    effect: (state, { zoneCoords }) => {
      magnetWarriorMergeAttempt(state, zoneCoords);
    },
  },

  // assorted
  [Monster.CatapultTurtle]: {
    text: `${Pre.Manual}All unused monsters on the own field will be launched by catapult.\nTheir combined ATK directly damages the opponent's LP.`,
    effect: (state, { ownMonsters, otherDKey, colIdx: monsterIdx }) => {
      // make all the unused monsters on the player's
      // field disappear and hit the foe with their combined power
      let combinedAtk = 0;
      const row = getRow(state, ownMonsters) as MonsterZone[];
      row.forEach((z, idx) => {
        if (isEmpty(z) || z.isLocked || idx === monsterIdx) return;
        combinedAtk += z.effAtk;
        destroyAtCoords(state, [...ownMonsters, idx]);
      });
      burn(state, otherDKey, combinedAtk);
    },
  },
  [Monster.TrapMaster]: {
    text: `${Pre.Manual}An Acid Trap Hole will be set if there is room on the own field.`,
    effect: (state, { dKey }) => {
      setSpellTrap(state, dKey, Trap.AcidTrapHole);
    },
  },
  [Monster.RocketWarrior]: {
    text: `${Pre.Manual}It transforms into a rocket that powers down a monster on the foe's field.`,
    effect: (state, { dKey }) => {
      powerDownHighestAtk(state, dKey);
    },
  },
  [Monster.MonsterEye]: {
    text: `${Pre.Manual}It will reveal the cards in the opponent's hand.`,
    effect: (state, { otherHand }) => {
      setRowFaceUp(state, otherHand);
    },
  },
  [Monster.GoddessOfWhim]: {
    text: `${Pre.Manual}It lets the player draw a card from the deck, then disappears.`,
    effect: (state, { dKey, zoneCoords }) => {
      draw(state, dKey);
      destroyAtCoords(state, zoneCoords);
    },
  },
  [Monster.Skelengel]: {
    text: `${Pre.Manual}One card will be drawn from the player's deck.`,
    effect: draw_Wrapped(),
  },
  [Monster.ByserShock]: {
    text: `${Pre.Manual}All face-down cards on both fields are returned to the players' hands if space allows.`,
    effect: (
      state,
      { ownMonsters, otherMonsters, ownSpellTrap, otherSpellTrap }
    ) => {
      // return all face-down cards on both fields to
      // the hands of both players if there is space in the hands
      const returnRowToHand = (rowCoords: RowCoords) => {
        getRow(state, rowCoords).forEach((z, i) => {
          if (isEmpty(z)) return;
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
    text: `${Pre.Manual}It will attack every monster on the opponent's field.`,
    effect: (state, { otherMonsters, zoneCoords }) => {
      // attack all enemy monsters from left to right in a single action
      getRow(state, otherMonsters).forEach((z, idx) => {
        // must re-get zone on each iteration of loop in order to check if
        // Berserk Dragon has destroyed itself before completing all attacks
        const originZone = getZone(state, zoneCoords) as OccupiedMonsterZone;
        if (isEmpty(z) || isEmpty(originZone)) {
          // don't attack if Berserk Dragon itself has been destroyed
          return;
        }
        attackMonster(state, zoneCoords, [...otherMonsters, idx]);
      });
    },
  },
  [Monster.BeastOfGilfer]: {
    text: `${Pre.Sacrifice}In return, it powers down every monster on the foe's field.`,
    effect: (state, { zoneCoords, otherMonsters }) => {
      updateMonsters(state, otherMonsters, (z: OccupiedMonsterZone) => {
        z.permPowerUpAtk -= 500;
        z.permPowerUpDef -= 500;
      });
      destroyAtCoords(state, zoneCoords);
    },
  },
};

export const hasFlipEffect = (id: CardId) => id in flipEffects;

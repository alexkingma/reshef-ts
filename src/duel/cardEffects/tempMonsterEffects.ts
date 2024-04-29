import { Monster, TempEffectMonster } from "../common";
import {
  countMatchesInRow,
  getHighestAtkZoneIdx,
  hasMatchInRow,
} from "../util/rowUtil";
import {
  getEffCon_powerUpSelfConditional,
  getEffCon_updateMatchesInRow,
} from "../util/wrappedUtil";
import {
  isAlignment,
  isSpecificMonster,
  isType,
  tempPowerDown,
  tempPowerUp,
} from "../util/zoneUtil";

export const tempMonsterEffects: CardReducerMap<
  TempEffectMonster,
  MultiEffConReducer
> = {
  // power down enemies
  [Monster.MammothGraveyard]: (state, { otherMonsters }) => {
    const effCon = getEffCon_updateMatchesInRow(
      state,
      otherMonsters,
      (z) => z.tempPowerUpLevel--
    );
    return [effCon];
  },
  [Monster.DarkJeroid]: (state, { otherMonsters }) => {
    return [
      {
        condition: () => {
          return hasMatchInRow(state, otherMonsters);
        },
        effect: () => {
          const targetIdx = getHighestAtkZoneIdx(state, otherMonsters);
          if (targetIdx === -1) return;
          tempPowerDown(state, [...otherMonsters, targetIdx]);
        },
      },
    ];
  },

  // power up cross-field
  [Monster.Hoshiningen]: (state, { ownMonsters, otherMonsters }) => {
    const matchLight = (z: OccupiedMonsterZone) => isAlignment(z, "Light");
    const matchDark = (z: OccupiedMonsterZone) => isAlignment(z, "Dark");
    const up = (z: OccupiedMonsterZone) => z.tempPowerUpLevel++;
    const down = (z: OccupiedMonsterZone) => z.tempPowerUpLevel--;

    return [
      getEffCon_updateMatchesInRow(state, ownMonsters, up, matchLight),
      getEffCon_updateMatchesInRow(state, ownMonsters, down, matchDark),
      getEffCon_updateMatchesInRow(state, otherMonsters, up, matchLight),
      getEffCon_updateMatchesInRow(state, otherMonsters, down, matchDark),
    ];
  },
  [Monster.WitchsApprentice]: (state, { ownMonsters, otherMonsters }) => {
    const matchLight = (z: OccupiedMonsterZone) => isAlignment(z, "Light");
    const matchDark = (z: OccupiedMonsterZone) => isAlignment(z, "Dark");
    const up = (z: OccupiedMonsterZone) => z.tempPowerUpLevel++;
    const down = (z: OccupiedMonsterZone) => z.tempPowerUpLevel--;

    return [
      getEffCon_updateMatchesInRow(state, ownMonsters, down, matchLight),
      getEffCon_updateMatchesInRow(state, ownMonsters, up, matchDark),
      getEffCon_updateMatchesInRow(state, otherMonsters, down, matchLight),
      getEffCon_updateMatchesInRow(state, otherMonsters, up, matchDark),
    ];
  },

  // power up allies
  [Monster.MysticalElf]: (state, { ownMonsters }) => {
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z) => z.tempPowerUpLevel++,
      (z) => isSpecificMonster(z, Monster.BlueEyesWhiteDragon)
    );
    return [effCon];
  },
  [Monster.HarpieLady]: (state, { ownMonsters }) => {
    // wording says powers up "a" pet dragon, but that's not how it works
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z) => z.tempPowerUpLevel++,
      (z) => isSpecificMonster(z, Monster.HarpiesPetDragon)
    );
    return [effCon];
  },
  [Monster.CyberHarpie]: (state, { ownMonsters }) => {
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z) => z.tempPowerUpLevel++,
      (z) => isSpecificMonster(z, Monster.HarpiesPetDragon)
    );
    return [effCon];
  },
  [Monster.HarpieLadySisters]: (state, { ownMonsters }) => {
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z) => (z.tempPowerUpLevel += 2),
      (z) => isSpecificMonster(z, Monster.HarpiesPetDragon)
    );
    return [effCon];
  },
  [Monster.MonsterTamer]: (state, { ownMonsters }) => {
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z) => z.tempPowerUpLevel++,
      (z) => isSpecificMonster(z, Monster.DungeonWorm)
    );
    return [effCon];
  },
  [Monster.PumpkingTheKingOfGhosts]: (state, { ownMonsters }) => {
    const cards: Monster[] = [
      Monster.ArmoredZombie,
      Monster.DragonZombie,
      Monster.ClownZombie,
    ];
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z) => z.tempPowerUpLevel++,
      (z) => cards.includes(z.card.id)
    );
    return [effCon];
  },
  [Monster.MWarrior1]: (state, { ownMonsters }) => {
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++,
      (z: OccupiedMonsterZone) => z.card.id === Monster.MWarrior2
    );
    return [effCon];
  },
  [Monster.MWarrior2]: (state, { ownMonsters }) => {
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++,
      (z: OccupiedMonsterZone) => z.card.id === Monster.MWarrior1
    );
    return [effCon];
  },
  [Monster.NightmarePenguin]: (state, { ownMonsters }) => {
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z) => z.tempPowerUpLevel++,
      (z) => ["Aqua", "Fish", "Sea Serpent", "Reptile"].includes(z.card.type)
    );
    return [effCon];
  },
  [Monster.CommandAngel]: (state, { ownMonsters }) => {
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z) => z.tempPowerUpLevel++,
      (z) => isType(z, "Fairy")
    );
    return [effCon];
  },

  // power up self
  [Monster.SwampBattleguard]: (state, { ownMonsters }) => {
    const isLavaBattleguard = (z: Zone) =>
      isSpecificMonster(z, Monster.LavaBattleguard);
    const effCon = getEffCon_powerUpSelfConditional([
      [state, ownMonsters, isLavaBattleguard],
    ]);
    return [effCon];
  },
  [Monster.LavaBattleguard]: (state, { ownMonsters }) => {
    const isSwampBattleguard = (z: Zone) =>
      isSpecificMonster(z, Monster.SwampBattleguard);
    const effCon = getEffCon_powerUpSelfConditional([
      [state, ownMonsters, isSwampBattleguard],
    ]);
    return [effCon];
  },
  [Monster.BusterBlader]: (state, { dKey, ownMonsters }) => {
    const isDragonZone = (z: Zone) => isType(z, "Dragon");
    const isDragonCard = (c: MonsterCard) => c.type === "Dragon";
    const effCon = getEffCon_powerUpSelfConditional(
      [[state, ownMonsters, isDragonZone]],
      [[state, dKey, isDragonCard]]
    );
    return [effCon];
  },
  [Monster.WodanTheResidentOfTheForest]: (state, { ownMonsters }) => {
    const isPlant = (z: Zone) => isType(z, "Plant");
    const effCon = getEffCon_powerUpSelfConditional([
      [state, ownMonsters, isPlant],
    ]);
    return [effCon];
  },
  [Monster.PerfectMachineKing]: (state, { ownMonsters, otherMonsters }) => {
    const isMachine = (z: Zone) => isType(z, "Machine");
    const effCon = getEffCon_powerUpSelfConditional([
      [state, ownMonsters, isMachine, 2],
      [state, otherMonsters, isMachine, 2],
    ]);
    return [effCon];
  },
  [Monster.SliferTheSkyDragon]: (state, { ownHand }) => {
    const effCon = getEffCon_powerUpSelfConditional([
      [state, ownHand, () => true, 3],
    ]);
    return [effCon];
  },
  [Monster.LabyrinthTank]: (state, { ownMonsters }) => {
    const isLabyrinthWall = (z: Zone) =>
      isSpecificMonster(z, Monster.LabyrinthWall);
    const effCon = getEffCon_powerUpSelfConditional([
      [state, ownMonsters, isLabyrinthWall],
    ]);
    return [effCon];
  },
  [Monster.MachineKing]: (state, { ownMonsters, otherMonsters }) => {
    const isMachine = (z: Zone) => isType(z, "Machine");
    const effCon = getEffCon_powerUpSelfConditional([
      [state, ownMonsters, isMachine],
      [state, otherMonsters, isMachine],
    ]);
    return [effCon];
  },
  [Monster.MasterOfDragonSoldier]: (state, { ownMonsters }) => {
    const isDragon = (z: Zone) => isType(z, "Dragon");
    const effCon = getEffCon_powerUpSelfConditional([
      [state, ownMonsters, isDragon],
    ]);
    return [effCon];
  },
  [Monster.DarkMagicianGirl]: (state, { dKey }) => {
    const isDarkMagician = (c: MonsterCard) => c.id === Monster.DarkMagician;
    const effCon = getEffCon_powerUpSelfConditional(
      [],
      [[state, dKey, isDarkMagician]]
    );
    return [effCon];
  },
  [Monster.ToonDarkMagicianGirl]: (state, { dKey }) => {
    const isDarkMagician = (c: MonsterCard) => c.id === Monster.DarkMagician;
    const effCon = getEffCon_powerUpSelfConditional(
      [],
      [[state, dKey, isDarkMagician]]
    );
    return [effCon];
  },
  [Monster.InsectQueen]: (state, { ownMonsters }) => {
    const isInsect = (z: Zone) => isType(z, "Insect");
    const effCon = getEffCon_powerUpSelfConditional([
      [state, ownMonsters, isInsect],
    ]);
    return [effCon];
  },
  [Monster.BladeKnight]: (state, { ownHand }) => {
    return [
      {
        condition: () => {
          return countMatchesInRow(state, ownHand) <= 1;
        },
        effect: (state, { zoneCoords }) => {
          tempPowerUp(state, zoneCoords);
        },
      },
    ];
  },
};

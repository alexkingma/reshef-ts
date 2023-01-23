import { Monster, TempPowerUpMonster } from "../common";
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

export const monsterTempPowerUpReducers: CardReducerMap<
  TempPowerUpMonster,
  MultiEffConReducer
> = {
  [Monster.SwampBattleguard]: (state, { ownMonsters }) => {
    const isLavaBattleguard = (z: Zone) =>
      isSpecificMonster(z, Monster.LavaBattleguard);
    const effCon = getEffCon_powerUpSelfConditional([
      [state, ownMonsters, isLavaBattleguard],
    ]);
    return [effCon];
  },
  [Monster.MammothGraveyard]: (state, { otherMonsters }) => {
    const effCon = getEffCon_updateMatchesInRow(
      state,
      otherMonsters,
      (z) => z.tempPowerUpLevel--
    );
    return [effCon];
  },
  [Monster.PumpkingTheKingOfGhosts]: (state, { ownMonsters }) => {
    const cards: CardName[] = [
      Monster.ArmoredZombie,
      Monster.DragonZombie,
      Monster.ClownZombie,
    ];
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z) => z.tempPowerUpLevel++,
      (z) => cards.includes(z.card.name)
    );
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
  [Monster.MWarrior1]: (state, { ownMonsters }) => {
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++,
      (z: OccupiedMonsterZone) => z.card.name === Monster.MWarrior2
    );
    return [effCon];
  },
  [Monster.MWarrior2]: (state, { ownMonsters }) => {
    const effCon = getEffCon_updateMatchesInRow(
      state,
      ownMonsters,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++,
      (z: OccupiedMonsterZone) => z.card.name === Monster.MWarrior1
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
  [Monster.LavaBattleguard]: (state, { ownMonsters }) => {
    const isSwampBattleguard = (z: Zone) =>
      isSpecificMonster(z, Monster.SwampBattleguard);
    const effCon = getEffCon_powerUpSelfConditional([
      [state, ownMonsters, isSwampBattleguard],
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
  [Monster.WitchsApprentice]: (state, { ownMonsters, otherMonsters }) => {
    const matchLight = (z: OccupiedMonsterZone) => z.card.alignment === "Light";
    const matchDark = (z: OccupiedMonsterZone) => z.card.alignment === "Dark";
    const up = (z: OccupiedMonsterZone) => z.tempPowerUpLevel++;
    const down = (z: OccupiedMonsterZone) => z.tempPowerUpLevel--;

    return [
      getEffCon_updateMatchesInRow(state, ownMonsters, down, matchLight),
      getEffCon_updateMatchesInRow(state, ownMonsters, up, matchDark),
      getEffCon_updateMatchesInRow(state, otherMonsters, down, matchLight),
      getEffCon_updateMatchesInRow(state, otherMonsters, up, matchDark),
    ];
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
  [Monster.ToonDarkMagicianGirl]: (state, { dKey }) => {
    const isDarkMagician = (c: MonsterCard) => c.name === Monster.DarkMagician;
    const effCon = getEffCon_powerUpSelfConditional(
      [],
      [[state, dKey, isDarkMagician]]
    );
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
    const isDarkMagician = (c: MonsterCard) => c.name === Monster.DarkMagician;
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
};

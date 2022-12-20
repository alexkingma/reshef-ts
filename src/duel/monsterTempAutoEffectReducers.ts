import { tempPowerDown, tempPowerUp } from "./cardEffectUtil";
import {
  getEffCon_powerUpSelfConditional,
  getEffCon_updateMatchesInRow,
} from "./cardEffectWrapped";
import { Monster, TempAutoEffectMonster } from "./common";
import {
  MonsterAutoEffectReducer,
  MonsterEffectReducer,
} from "./coreDuelReducers";
import {
  countMatchesInRow,
  getHighestAtkZoneIdx,
  hasMatchInRow,
  isSpecificMonster,
  isType,
} from "./duelUtil";

type MonsterTempAutoEffectReducers = {
  [key in TempAutoEffectMonster]: MonsterAutoEffectReducer<MonsterEffectReducer>;
};

export const monsterTempAutoEffectReducers: MonsterTempAutoEffectReducers = {
  [Monster.SwampBattleguard]: ({ originatorState }) => {
    const isLavaBattleguard = (z: Zone) =>
      isSpecificMonster(z, Monster.LavaBattleguard);
    const effCon = getEffCon_powerUpSelfConditional([
      [originatorState.monsterZones, isLavaBattleguard],
    ]);
    return [effCon];
  },
  [Monster.MammothGraveyard]: ({ targetState }) => {
    const effCon = getEffCon_updateMatchesInRow(
      targetState.monsterZones,
      () => true,
      (z) => z.tempPowerUpLevel--
    );
    return [effCon];
  },
  [Monster.PumpkingTheKingOfGhosts]: ({ originatorState }) => {
    const cards: CardName[] = [
      Monster.ArmoredZombie,
      Monster.DragonZombie,
      Monster.ClownZombie,
    ];
    const effCon = getEffCon_updateMatchesInRow(
      originatorState.monsterZones,
      (z) => cards.includes(z.card.name),
      (z) => z.tempPowerUpLevel++
    );
    return [effCon];
  },
  [Monster.BusterBlader]: ({ targetState }) => {
    const isDragonZone = (z: Zone) => isType(z, "Dragon");
    const isDragonCard = (c: MonsterCard) => c.type === "Dragon";
    const effCon = getEffCon_powerUpSelfConditional(
      [[targetState.monsterZones, isDragonZone]],
      [[targetState.graveyard, isDragonCard]]
    );
    return [effCon];
  },
  [Monster.MWarrior1]: ({ originatorState }) => {
    const effCon = getEffCon_updateMatchesInRow(
      originatorState.monsterZones,
      (z: OccupiedMonsterZone) => z.card.name !== Monster.MWarrior2,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++
    );
    return [effCon];
  },
  [Monster.MWarrior2]: ({ originatorState }) => {
    const effCon = getEffCon_updateMatchesInRow(
      originatorState.monsterZones,
      (z: OccupiedMonsterZone) => z.card.name !== Monster.MWarrior1,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++
    );
    return [effCon];
  },
  [Monster.NightmarePenguin]: ({ originatorState }) => {
    const effCon = getEffCon_updateMatchesInRow(
      originatorState.monsterZones,
      (z) => ["Aqua", "Fish", "Sea Serpent", "Reptile"].includes(z.card.type),
      (z) => z.tempPowerUpLevel++
    );
    return [effCon];
  },
  [Monster.WodanTheResidentOfTheForest]: ({ originatorState }) => {
    const isPlant = (z: Zone) => isType(z, "Plant");
    const effCon = getEffCon_powerUpSelfConditional([
      [originatorState.monsterZones, isPlant],
    ]);
    return [effCon];
  },
  [Monster.PerfectMachineKing]: ({ originatorState, targetState }) => {
    const isMachine = (z: Zone) => isType(z, "Machine");
    const effCon = getEffCon_powerUpSelfConditional([
      [originatorState.monsterZones, isMachine, 2],
      [targetState.monsterZones, isMachine, 2],
    ]);
    return [effCon];
  },
  [Monster.SliferTheSkyDragon]: ({ originatorState }) => {
    const effCon = getEffCon_powerUpSelfConditional([
      [originatorState.hand, () => true, 3],
    ]);
    return [effCon];
  },
  [Monster.LabyrinthTank]: ({ originatorState }) => {
    const isLabyrinthWall = (z: Zone) =>
      isSpecificMonster(z, Monster.LabyrinthWall);
    const effCon = getEffCon_powerUpSelfConditional([
      [originatorState.monsterZones, isLabyrinthWall],
    ]);
    return [effCon];
  },
  [Monster.MachineKing]: ({ originatorState, targetState }) => {
    const isMachine = (z: Zone) => isType(z, "Machine");
    const effCon = getEffCon_powerUpSelfConditional([
      [originatorState.monsterZones, isMachine],
      [targetState.monsterZones, isMachine],
    ]);
    return [effCon];
  },
  [Monster.Hoshiningen]: ({ originatorState, targetState }) => {
    const matchLight = (z: OccupiedMonsterZone) => z.card.alignment === "Light";
    const matchDark = (z: OccupiedMonsterZone) => z.card.alignment === "Dark";
    const up = (z: OccupiedMonsterZone) => z.tempPowerUpLevel++;
    const down = (z: OccupiedMonsterZone) => z.tempPowerUpLevel--;

    return [
      getEffCon_updateMatchesInRow(
        originatorState.monsterZones,
        matchLight,
        up
      ),
      getEffCon_updateMatchesInRow(
        originatorState.monsterZones,
        matchDark,
        down
      ),
      getEffCon_updateMatchesInRow(targetState.monsterZones, matchLight, up),
      getEffCon_updateMatchesInRow(targetState.monsterZones, matchDark, down),
    ];
  },
  [Monster.LavaBattleguard]: ({ originatorState }) => {
    const isSwampBattleguard = (z: Zone) =>
      isSpecificMonster(z, Monster.SwampBattleguard);
    const effCon = getEffCon_powerUpSelfConditional([
      [originatorState.monsterZones, isSwampBattleguard],
    ]);
    return [effCon];
  },
  [Monster.BladeKnight]: ({ originatorState }, monsterIdx) => {
    return [
      {
        condition: () => {
          return countMatchesInRow(originatorState.hand) <= 1;
        },
        effect: () => {
          tempPowerUp(originatorState, monsterIdx);
        },
      },
    ];
  },
  [Monster.DarkJeroid]: ({ targetState }) => {
    return [
      {
        condition: () => {
          return hasMatchInRow(targetState.monsterZones);
        },
        effect: () => {
          const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
          if (targetIdx === -1) return;
          tempPowerDown(targetState, targetIdx);
        },
      },
    ];
  },
  [Monster.WitchsApprentice]: ({ originatorState, targetState }) => {
    const matchLight = (z: OccupiedMonsterZone) => z.card.alignment === "Light";
    const matchDark = (z: OccupiedMonsterZone) => z.card.alignment === "Dark";
    const up = (z: OccupiedMonsterZone) => z.tempPowerUpLevel++;
    const down = (z: OccupiedMonsterZone) => z.tempPowerUpLevel--;

    return [
      getEffCon_updateMatchesInRow(
        originatorState.monsterZones,
        matchLight,
        down
      ),
      getEffCon_updateMatchesInRow(originatorState.monsterZones, matchDark, up),
      getEffCon_updateMatchesInRow(targetState.monsterZones, matchLight, down),
      getEffCon_updateMatchesInRow(targetState.monsterZones, matchDark, up),
    ];
  },
  [Monster.CommandAngel]: ({ originatorState }) => {
    const effCon = getEffCon_updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.type === "Fairy",
      (z) => z.tempPowerUpLevel++
    );
    return [effCon];
  },
  [Monster.ToonDarkMagicianGirl]: ({ originatorState }) => {
    const isDarkMagician = (c: MonsterCard) => c.name === Monster.DarkMagician;
    const effCon = getEffCon_powerUpSelfConditional(
      [],
      [[originatorState.graveyard, isDarkMagician]]
    );
    return [effCon];
  },
  [Monster.MasterOfDragonSoldier]: ({ originatorState }) => {
    const isDragon = (z: Zone) => isType(z, "Dragon");
    const effCon = getEffCon_powerUpSelfConditional([
      [originatorState.monsterZones, isDragon],
    ]);
    return [effCon];
  },
  [Monster.DarkMagicianGirl]: ({ originatorState }) => {
    const isDarkMagician = (c: MonsterCard) => c.name === Monster.DarkMagician;
    const effCon = getEffCon_powerUpSelfConditional(
      [],
      [[originatorState.graveyard, isDarkMagician]]
    );
    return [effCon];
  },
  [Monster.InsectQueen]: ({ originatorState }) => {
    const isInsect = (z: Zone) => isType(z, "Insect");
    const effCon = getEffCon_powerUpSelfConditional([
      [originatorState.monsterZones, isInsect],
    ]);
    return [effCon];
  },
};

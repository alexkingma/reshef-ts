import {
  clearAllTraps,
  destroySelf,
  permPowerUp,
  powerDownHighestAtk,
  powerUpSelfConditional,
  setField,
  setRowFaceDown,
  specialSummon,
  tempPowerDown,
  tempPowerUp,
  updateMatchesInRow,
} from "./cardEffectUtil";
import { permPowerUp as permPowerUp_Wrapped } from "./cardEffectWrapped";
import { AutoEffectMonster, Field, Monster } from "./common";
import { ReducerArg } from "./duelSlice";
import {
  getExodiaCards,
  getHighestAtkZoneIdx,
  getNumCardsInRow,
  hasMatchInRow,
  isSpecificMonster,
  isType,
} from "./duelUtil";

type MonsterAutoEffectReducers = {
  [key in AutoEffectMonster]: (arg: ReducerArg, monsterIdx: FieldCol) => void;
};

export const monsterAutoEffectReducers: MonsterAutoEffectReducers = {
  [Monster.SwampBattleguard]: ({ originatorState }, monsterIdx) => {
    const isLavaBattleguard = (z: Zone) =>
      isSpecificMonster(z, Monster.LavaBattleguard);
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isLavaBattleguard],
    ]);
  },
  [Monster.MammothGraveyard]: ({ targetState }) => {
    updateMatchesInRow(
      targetState.monsterZones,
      () => true,
      (z) => z.tempPowerUpLevel--
    );
  },
  [Monster.CastleOfDarkIllusions]: ({ state, originatorState }) => {
    setField(state, Field.Yami);
    setRowFaceDown(originatorState.monsterZones);
  },
  [Monster.PumpkingTheKingOfGhosts]: ({ originatorState }) => {
    const cards: CardName[] = [
      Monster.ArmoredZombie,
      Monster.DragonZombie,
      Monster.ClownZombie,
    ];
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => cards.includes(z.card.name),
      (z) => z.tempPowerUpLevel++
    );
  },
  [Monster.BusterBlader]: ({ originatorState, targetState }, monsterIdx) => {
    // powers up for every dragon monster on the opponent's field and graveyard
    const isDragonZone = (z: Zone) => isType(z, "Dragon");
    const isDragonCard = (c: MonsterCard) => c.type === "Dragon";
    powerUpSelfConditional(
      originatorState,
      monsterIdx,
      [[targetState.monsterZones, isDragonZone]],
      [[targetState.graveyard, isDragonCard]]
    );
  },
  [Monster.MWarrior1]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z: OccupiedMonsterZone) => z.card.name !== Monster.MWarrior2,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++
    );
  },
  [Monster.MWarrior2]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z: OccupiedMonsterZone) => z.card.name !== Monster.MWarrior1,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++
    );
  },
  [Monster.NightmarePenguin]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => ["Aqua", "Fish", "Sea Serpent", "Reptile"].includes(z.card.type),
      (z) => z.tempPowerUpLevel++
    );
  },
  [Monster.WodanTheResidentOfTheForest]: ({ originatorState }, monsterIdx) => {
    const isPlant = (z: Zone) => isType(z, "Plant");
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isPlant],
    ]);
  },
  [Monster.PerfectMachineKing]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    const isMachine = (z: Zone) => isType(z, "Machine");
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isMachine, 2],
      [targetState.monsterZones, isMachine, 2],
    ]);
  },
  [Monster.SliferTheSkyDragon]: ({ originatorState }, monsterIdx) => {
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.hand, () => true, 3],
    ]);
  },
  [Monster.SatelliteCannon]: permPowerUp_Wrapped(2),
  [Monster.LabyrinthTank]: ({ originatorState }, monsterIdx) => {
    const isLabyrinthWall = (z: Zone) =>
      isSpecificMonster(z, Monster.LabyrinthWall);
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isLabyrinthWall],
    ]);
  },
  [Monster.MachineKing]: ({ originatorState, targetState }, monsterIdx) => {
    const isMachine = (z: Zone) => isType(z, "Machine");
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isMachine],
      [targetState.monsterZones, isMachine],
    ]);
  },
  [Monster.Hoshiningen]: ({ originatorState, targetState }) => {
    const matchLight = (z: OccupiedMonsterZone) => z.card.alignment === "Light";
    const matchDark = (z: OccupiedMonsterZone) => z.card.alignment === "Dark";
    const up = (z: OccupiedMonsterZone) => z.tempPowerUpLevel++;
    const down = (z: OccupiedMonsterZone) => z.tempPowerUpLevel--;

    updateMatchesInRow(originatorState.monsterZones, matchLight, up);
    updateMatchesInRow(originatorState.monsterZones, matchDark, down);
    updateMatchesInRow(targetState.monsterZones, matchLight, up);
    updateMatchesInRow(targetState.monsterZones, matchDark, down);
  },
  [Monster.ThunderNyanNyan]: ({ originatorState }, monsterIdx) => {
    const nonLightExists = hasMatchInRow(
      originatorState.monsterZones,
      (z) => (z.card as MonsterCard).alignment !== "Light"
    );
    if (nonLightExists) {
      destroySelf(originatorState, monsterIdx);
    }
  },
  [Monster.LavaBattleguard]: ({ originatorState }, monsterIdx) => {
    const isSwampBattleguard = (z: Zone) =>
      isSpecificMonster(z, Monster.SwampBattleguard);
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isSwampBattleguard],
    ]);
  },
  [Monster.BladeKnight]: ({ originatorState }, monsterIdx) => {
    const count = getNumCardsInRow(originatorState.hand);
    if (count <= 1) {
      tempPowerUp(originatorState, monsterIdx);
    }
  },
  [Monster.ExodiaNecross]: ({ originatorState }, monsterIdx) => {
    // powers up at the start of the own turn
    // If there are no Exodia parts in the graveyard, it disappears

    // TODO -- split this into separate start-of-turn and perpetual fns

    // start-of-turn only
    permPowerUp(originatorState, monsterIdx);

    // perpetual check
    if (
      originatorState.graveyard &&
      getExodiaCards().includes(originatorState.graveyard)
    ) {
      destroySelf(originatorState, monsterIdx);
    }
  },
  [Monster.LavaGolem]: ({ originatorState, targetState }, monsterIdx) => {
    // TODO -- auto, start of turn
    // burn for 700 at start of own turn
  },
  [Monster.DarkJeroid]: ({ targetState }) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return;
    tempPowerDown(targetState, targetIdx);
  },
  [Monster.ViserDes]: ({ targetState }) => {
    powerDownHighestAtk(targetState);
  },
  [Monster.WitchsApprentice]: ({ originatorState, targetState }) => {
    const matchLight = (z: OccupiedMonsterZone) => z.card.alignment === "Light";
    const matchDark = (z: OccupiedMonsterZone) => z.card.alignment === "Dark";
    const up = (z: OccupiedMonsterZone) => z.tempPowerUpLevel++;
    const down = (z: OccupiedMonsterZone) => z.tempPowerUpLevel--;

    updateMatchesInRow(originatorState.monsterZones, matchLight, down);
    updateMatchesInRow(originatorState.monsterZones, matchDark, up);
    updateMatchesInRow(targetState.monsterZones, matchLight, down);
    updateMatchesInRow(targetState.monsterZones, matchDark, up);
  },
  [Monster.MirageKnight]: ({ originatorState }, monsterIdx) => {
    destroySelf(originatorState, monsterIdx);
    specialSummon(originatorState, Monster.DarkMagician);
    specialSummon(originatorState, Monster.FlameSwordsman);
  },
  [Monster.BerserkDragon]: ({ originatorState }, monsterIdx) => {
    // powers down at the start of the foe's turn
    tempPowerDown(originatorState, monsterIdx);
  },
  [Monster.CommandAngel]: ({ originatorState, targetState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.type === "Fairy",
      (z) => z.tempPowerUpLevel++
    );
  },
  [Monster.ToonDarkMagicianGirl]: ({ originatorState }, monsterIdx) => {
    const isDarkMagician = (c: MonsterCard) => c.name === Monster.DarkMagician;
    powerUpSelfConditional(
      originatorState,
      monsterIdx,
      [],
      [[originatorState.graveyard, isDarkMagician]]
    );
  },
  [Monster.MasterOfDragonSoldier]: ({ originatorState }, monsterIdx) => {
    const isDragon = (z: Zone) => isType(z, "Dragon");
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isDragon],
    ]);
  },
  [Monster.Jinzo]: ({ targetState }) => {
    clearAllTraps(targetState);
  },
  [Monster.DarkMagicianGirl]: ({ originatorState }, monsterIdx) => {
    const isDarkMagician = (c: MonsterCard) => c.name === Monster.DarkMagician;
    powerUpSelfConditional(
      originatorState,
      monsterIdx,
      [],
      [[originatorState.graveyard, isDarkMagician]]
    );
  },
  [Monster.InsectQueen]: ({ originatorState }, monsterIdx) => {
    const isInsect = (z: Zone) => isType(z, "Insect");
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isInsect],
    ]);
  },
};

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
  [AutoEffectMonster.SwampBattleguard]: ({ originatorState }, monsterIdx) => {
    const isLavaBattleguard = (z: Zone) =>
      isSpecificMonster(z, Monster.LavaBattleguard);
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isLavaBattleguard],
    ]);
  },
  [AutoEffectMonster.MammothGraveyard]: ({ targetState }) => {
    updateMatchesInRow(
      targetState.monsterZones,
      () => true,
      (z) => z.tempPowerUpLevel--
    );
  },
  [AutoEffectMonster.CastleOfDarkIllusions]: ({ state, originatorState }) => {
    setField(state, Field.Yami);
    setRowFaceDown(originatorState.monsterZones);
  },
  [AutoEffectMonster.PumpkingTheKingOfGhosts]: ({ originatorState }) => {
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
  [AutoEffectMonster.BusterBlader]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
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
  [AutoEffectMonster.MWarrior1]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z: OccupiedMonsterZone) => z.card.name !== Monster.MWarrior2,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++
    );
  },
  [AutoEffectMonster.MWarrior2]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z: OccupiedMonsterZone) => z.card.name !== Monster.MWarrior1,
      (z: OccupiedMonsterZone) => z.tempPowerUpLevel++
    );
  },
  [AutoEffectMonster.NightmarePenguin]: ({ originatorState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => ["Aqua", "Fish", "Sea Serpent", "Reptile"].includes(z.card.type),
      (z) => z.tempPowerUpLevel++
    );
  },
  [AutoEffectMonster.WodanTheResidentOfTheForest]: (
    { originatorState },
    monsterIdx
  ) => {
    const isPlant = (z: Zone) => isType(z, "Plant");
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isPlant],
    ]);
  },
  [AutoEffectMonster.PerfectMachineKing]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    const isMachine = (z: Zone) => isType(z, "Machine");
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isMachine, 2],
      [targetState.monsterZones, isMachine, 2],
    ]);
  },
  [AutoEffectMonster.SliferTheSkyDragon]: ({ originatorState }, monsterIdx) => {
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.hand, () => true, 3],
    ]);
  },
  [AutoEffectMonster.SatelliteCannon]: permPowerUp_Wrapped(2),
  [AutoEffectMonster.LabyrinthTank]: ({ originatorState }, monsterIdx) => {
    const isLabyrinthWall = (z: Zone) =>
      isSpecificMonster(z, Monster.LabyrinthWall);
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isLabyrinthWall],
    ]);
  },
  [AutoEffectMonster.MachineKing]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    const isMachine = (z: Zone) => isType(z, "Machine");
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isMachine],
      [targetState.monsterZones, isMachine],
    ]);
  },
  [AutoEffectMonster.Hoshiningen]: ({ originatorState, targetState }) => {
    const matchLight = (z: OccupiedMonsterZone) => z.card.alignment === "Light";
    const matchDark = (z: OccupiedMonsterZone) => z.card.alignment === "Dark";
    const up = (z: OccupiedMonsterZone) => z.tempPowerUpLevel++;
    const down = (z: OccupiedMonsterZone) => z.tempPowerUpLevel--;

    updateMatchesInRow(originatorState.monsterZones, matchLight, up);
    updateMatchesInRow(originatorState.monsterZones, matchDark, down);
    updateMatchesInRow(targetState.monsterZones, matchLight, up);
    updateMatchesInRow(targetState.monsterZones, matchDark, down);
  },
  [AutoEffectMonster.ThunderNyanNyan]: ({ originatorState }, monsterIdx) => {
    const nonLightExists = hasMatchInRow(
      originatorState.monsterZones,
      (z) => (z.card as MonsterCard).alignment !== "Light"
    );
    if (nonLightExists) {
      destroySelf(originatorState, monsterIdx);
    }
  },
  [AutoEffectMonster.LavaBattleguard]: ({ originatorState }, monsterIdx) => {
    const isSwampBattleguard = (z: Zone) =>
      isSpecificMonster(z, Monster.SwampBattleguard);
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isSwampBattleguard],
    ]);
  },
  [AutoEffectMonster.BladeKnight]: ({ originatorState }, monsterIdx) => {
    const count = getNumCardsInRow(originatorState.hand);
    if (count <= 1) {
      tempPowerUp(originatorState, monsterIdx);
    }
  },
  [AutoEffectMonster.ExodiaNecross]: ({ originatorState }, monsterIdx) => {
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
  [AutoEffectMonster.LavaGolem]: (
    { originatorState, targetState },
    monsterIdx
  ) => {
    // TODO -- auto, start of turn
    // If this is in the own hand, it can be made to appear on
    // the enemy's field for two enemy monsters as tributes.
    // hidden effect is burn for 700 at start of own turn
  },
  [AutoEffectMonster.DarkJeroid]: ({ targetState }) => {
    const targetIdx = getHighestAtkZoneIdx(targetState.monsterZones);
    if (targetIdx === -1) return;
    tempPowerDown(targetState, targetIdx);
  },
  [AutoEffectMonster.ViserDes]: ({ targetState }) => {
    powerDownHighestAtk(targetState);
  },
  [AutoEffectMonster.WitchsApprentice]: ({ originatorState, targetState }) => {
    const matchLight = (z: OccupiedMonsterZone) => z.card.alignment === "Light";
    const matchDark = (z: OccupiedMonsterZone) => z.card.alignment === "Dark";
    const up = (z: OccupiedMonsterZone) => z.tempPowerUpLevel++;
    const down = (z: OccupiedMonsterZone) => z.tempPowerUpLevel--;

    updateMatchesInRow(originatorState.monsterZones, matchLight, down);
    updateMatchesInRow(originatorState.monsterZones, matchDark, up);
    updateMatchesInRow(targetState.monsterZones, matchLight, down);
    updateMatchesInRow(targetState.monsterZones, matchDark, up);
  },
  [AutoEffectMonster.MirageKnight]: ({ originatorState }, monsterIdx) => {
    destroySelf(originatorState, monsterIdx);
    specialSummon(originatorState, Monster.DarkMagician);
    specialSummon(originatorState, Monster.FlameSwordsman);
  },
  [AutoEffectMonster.BerserkDragon]: ({ originatorState }, monsterIdx) => {
    // powers down at the start of the foe's turn
    tempPowerDown(originatorState, monsterIdx);
  },
  [AutoEffectMonster.CommandAngel]: ({ originatorState, targetState }) => {
    updateMatchesInRow(
      originatorState.monsterZones,
      (z) => z.card.type === "Fairy",
      (z) => z.tempPowerUpLevel++
    );
  },
  [AutoEffectMonster.ToonDarkMagicianGirl]: (
    { originatorState },
    monsterIdx
  ) => {
    const isDarkMagician = (c: MonsterCard) => c.name === Monster.DarkMagician;
    powerUpSelfConditional(
      originatorState,
      monsterIdx,
      [],
      [[originatorState.graveyard, isDarkMagician]]
    );
  },
  [AutoEffectMonster.MasterOfDragonSoldier]: (
    { originatorState },
    monsterIdx
  ) => {
    const isDragon = (z: Zone) => isType(z, "Dragon");
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isDragon],
    ]);
  },
  [AutoEffectMonster.Jinzo]: ({ targetState }) => {
    clearAllTraps(targetState);
  },
  [AutoEffectMonster.DarkMagicianGirl]: ({ originatorState }, monsterIdx) => {
    const isDarkMagician = (c: MonsterCard) => c.name === Monster.DarkMagician;
    powerUpSelfConditional(
      originatorState,
      monsterIdx,
      [],
      [[originatorState.graveyard, isDarkMagician]]
    );
  },
  [AutoEffectMonster.InsectQueen]: ({ originatorState }, monsterIdx) => {
    const isInsect = (z: Zone) => isType(z, "Insect");
    powerUpSelfConditional(originatorState, monsterIdx, [
      [originatorState.monsterZones, isInsect],
    ]);
  },
};

import { BattlePosition, DKey, RowKey } from "@/duel/enums/duel";
import { Monster } from "@/duel/enums/monster";
import { beforeEach, describe, expect, test } from "vitest";
import { getNewDuel } from "../duelUtil";
import {
  calculateAttack,
  generateOccupiedMonsterZone as createZone,
} from "../zoneUtil";

let dark_700_600: OccupiedMonsterZone;
let dark_800_700: OccupiedMonsterZone;
let dark_2500_2100: OccupiedMonsterZone;
let dreams_700_700: OccupiedMonsterZone;
let dreams_2800_2000: OccupiedMonsterZone;
let light_700_600: OccupiedMonsterZone;
let light_3000_2500: OccupiedMonsterZone;

const getState = (
  ownMon: OccupiedMonsterZone,
  otherMon: OccupiedMonsterZone
) => {
  const state = getNewDuel();
  state.duellists[DKey.Player].monsterZones[0] = ownMon;
  state.duellists[DKey.Opponent].monsterZones[0] = otherMon;
  return state;
};

const originCoords: ZoneCoords = [DKey.Player, RowKey.Monster, 0];
const targetCoords: ZoneCoords = [DKey.Opponent, RowKey.Monster, 0];

beforeEach(() => {
  dark_700_600 = createZone(Monster.PhantomDewan);
  dark_800_700 = createZone(Monster.Nemuriko);
  dark_2500_2100 = createZone(Monster.DarkMagician);
  dreams_700_700 = createZone(Monster.TheBewitchingPhantomThief);
  dreams_2800_2000 = createZone(Monster.MirageKnight);
  light_700_600 = createZone(Monster.HourglassOfLife);
  light_3000_2500 = createZone(Monster.BlueEyesWhiteDragon);
});

describe("neutral alignment", () => {
  describe("attackMonster", () => {
    test("high atk vs low atk", () => {
      const state = getState(dark_2500_2100, dark_700_600);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(1800);
    });

    test("low atk vs high atk", () => {
      const state = getState(dark_700_600, dark_2500_2100);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(1800);
      expect(targetLpLoss).toEqual(0);
    });

    test("high atk vs low def", () => {
      dark_700_600.battlePosition = BattlePosition.Defence;
      const state = getState(dark_2500_2100, dark_700_600);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("low atk vs high def", () => {
      dark_2500_2100.battlePosition = BattlePosition.Defence;
      const state = getState(dark_700_600, dark_2500_2100);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(1400);
      expect(targetLpLoss).toEqual(0);
    });

    test("equal atk/atk", () => {
      const state = getState(dark_2500_2100, dark_2500_2100);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("equal atk/def", () => {
      dark_800_700.battlePosition = BattlePosition.Defence;
      const state = getState(dark_700_600, dark_800_700);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });
  });

  describe("strong alignment", () => {
    test("high atk vs low atk", () => {
      const state = getState(dreams_2800_2000, dark_700_600);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(2100);
    });

    test("low atk vs high atk", () => {
      const state = getState(dreams_700_700, dark_2500_2100);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("high atk vs low def", () => {
      dark_700_600.battlePosition = BattlePosition.Defence;
      const state = getState(dreams_2800_2000, dark_700_600);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("low atk vs high def", () => {
      dark_2500_2100.battlePosition = BattlePosition.Defence;
      const state = getState(dreams_700_700, dark_2500_2100);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("equal atk/atk", () => {
      const state = getState(dreams_700_700, dark_700_600);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("equal atk/def", () => {
      dark_800_700.battlePosition = BattlePosition.Defence;
      const state = getState(dreams_700_700, dark_800_700);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });
  });

  describe("weak alignment", () => {
    test("high atk vs low atk", () => {
      const state = getState(light_3000_2500, dark_700_600);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("low atk vs high atk", () => {
      const state = getState(light_700_600, dark_2500_2100);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(1800);
      expect(targetLpLoss).toEqual(0);
    });

    test("high atk vs low def", () => {
      dark_700_600.battlePosition = BattlePosition.Defence;
      const state = getState(light_3000_2500, dark_700_600);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("low atk vs high def", () => {
      dark_2500_2100.battlePosition = BattlePosition.Defence;
      const state = getState(light_700_600, dark_2500_2100);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(1400);
      expect(targetLpLoss).toEqual(0);
    });

    test("equal atk/atk", () => {
      const state = getState(light_700_600, dark_700_600);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("equal atk/def", () => {
      dark_800_700.battlePosition = BattlePosition.Defence;
      const state = getState(light_700_600, dark_800_700);
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = calculateAttack(state, originCoords, targetCoords);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });
  });
});

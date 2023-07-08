import { DuellistKey, Monster, RowKey } from "../../common";
import { canAISummonMonster, getFaceUpTarget } from "../aiUtil";
import { getTempCardQuantMap } from "../deckUtil";
import { getNewDuel } from "../duelUtil";
import { generateOccupiedMonsterZone } from "../zoneUtil";

describe("canAISummonMonster", () => {
  const getState = (
    hand: (Monster | null)[],
    ownMonsters: (Monster | null)[]
  ) => {
    let state: Duel = getNewDuel(getTempCardQuantMap(), getTempCardQuantMap());
    state.p1.hand.forEach((z, i, zones) => {
      const c = hand[i];
      zones[i] = c ? generateOccupiedMonsterZone(c) : { isOccupied: false };
    });
    state.p1.monsterZones.forEach((z, i, zones) => {
      const c = ownMonsters[i];
      zones[i] = c ? generateOccupiedMonsterZone(c) : { isOccupied: false };
    });
    return state;
  };

  const makeCoords = (idx: number): ZoneCoords => [
    DuellistKey.Player,
    RowKey.Hand,
    idx,
  ];

  test("0 tributes", () => {
    const state = getState([Monster.Kuriboh], []);
    expect(canAISummonMonster(state, makeCoords(0))).toBe(true);
  });
  test("1 tribute", () => {
    const state = getState([Monster.CurseOfDragon], [Monster.Kuriboh]);
    expect(canAISummonMonster(state, makeCoords(0))).toBe(true);
  });
  test("2 tributes", () => {
    const state = getState(
      [Monster.DarkMagician],
      [Monster.Kuriboh, Monster.CurseOfDragon]
    );
    expect(canAISummonMonster(state, makeCoords(0))).toBe(true);
  });
  test("3 tributes", () => {
    const state = getState(
      [Monster.ObeliskTheTormentor],
      [Monster.Kuriboh, Monster.CurseOfDragon, Monster.DarkMagician]
    );
    expect(canAISummonMonster(state, makeCoords(0))).toBe(true);
  });
  test("0/1 tributes", () => {
    const state = getState([Monster.CurseOfDragon], []);
    expect(canAISummonMonster(state, makeCoords(0))).toBe(false);
  });
  test("1/2 tributes", () => {
    const state = getState([Monster.BlueEyesWhiteDragon], [Monster.Kuriboh]);
    expect(canAISummonMonster(state, makeCoords(0))).toBe(false);
  });
  test("monsters too strong to tribute", () => {
    const state = getState([Monster.CurseOfDragon], [Monster.SummonedSkull]);
    expect(canAISummonMonster(state, makeCoords(0))).toBe(false);
  });
  test("no space to summon, can't overwrite", () => {
    const state = getState(
      [Monster.TheUnhappyMaiden],
      [
        Monster.BlueEyesUltimateDragon,
        Monster.BlueEyesUltimateDragon,
        Monster.BlueEyesUltimateDragon,
        Monster.BlueEyesUltimateDragon,
        Monster.BlueEyesUltimateDragon,
      ]
    );
    expect(canAISummonMonster(state, makeCoords(0))).toBe(false);
  });
  test("no space to summon, should overwrite", () => {
    const state = getState(
      [Monster.DarkElf],
      [
        Monster.Kuriboh,
        Monster.Kuriboh,
        Monster.Kuriboh,
        Monster.Kuriboh,
        Monster.Kuriboh,
      ]
    );
    expect(canAISummonMonster(state, makeCoords(0))).toBe(true);
  });
});

describe("getFaceUpTarget", () => {
  const getState = (
    ownMonsters: (Monster | null)[],
    otherMonsters: (Monster | null)[]
  ) => {
    let state: Duel = getNewDuel(getTempCardQuantMap(), getTempCardQuantMap());
    state.p1.monsterZones.forEach((z, i, zones) => {
      const c = ownMonsters[i];
      zones[i] = c ? generateOccupiedMonsterZone(c) : { isOccupied: false };
    });
    state.p2.monsterZones.forEach((z, i, zones) => {
      const c = otherMonsters[i];
      zones[i] = c ? generateOccupiedMonsterZone(c) : { isOccupied: false };
    });
    return state;
  };

  const makeCoords = (idx: number): ZoneCoords => [
    DuellistKey.Player,
    RowKey.Monster,
    idx,
  ];

  describe("no targets", () => {
    test("no targets", () => {
      const state = getState([Monster.Kuriboh], []);
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(-1);
    });
  });

  describe("single target", () => {
    test("valid target", () => {
      const state = getState([Monster.DarkMagician], [Monster.Kuriboh]);
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(0);
    });
    test("valid nonzero-idx target", () => {
      const state = getState(
        [Monster.DarkMagician],
        [null, null, Monster.Kuriboh]
      );
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(2);
    });
    test("target too strong", () => {
      const state = getState(
        [Monster.DarkMagician],
        [Monster.MaskedBeastDesGardius]
      );
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(-1);
    });
    test("equal atk target", () => {
      const state = getState([Monster.DarkMagician], [Monster.SummonedSkull]);
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(-1);
    });
    test("equal atk target, has backup", () => {
      const state = getState(
        [Monster.DarkMagician, Monster.ThousandEyesIdol],
        [Monster.SummonedSkull]
      );
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(0);
    });
  });

  describe("multiple targets", () => {
    test("weaker targets", () => {
      const state = getState(
        [Monster.DarkMagician],
        [Monster.Kuriboh, Monster.CurseOfDragon]
      );
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(1);
    });
    test("weaker/equal targets", () => {
      const state = getState(
        [Monster.DarkMagician],
        [Monster.Kuriboh, Monster.SkullServant]
      );
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(0);
    });
    test("stronger targets", () => {
      const state = getState(
        [Monster.DarkMagician],
        [Monster.FGD, Monster.BlueEyesUltimateDragon]
      );
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(-1);
    });
    test("weak/strong targets", () => {
      const state = getState(
        [Monster.DarkMagician],
        [Monster.FGD, Monster.DarkMagicianGirl]
      );
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(1);
    });
    test("equal/weak", () => {
      const state = getState(
        [Monster.DarkMagician],
        [Monster.SummonedSkull, Monster.DarkMagicianGirl]
      );
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(1);
    });
    test("equal/strong", () => {
      const state = getState(
        [Monster.DarkMagician],
        [Monster.BlueEyesUltimateDragon, Monster.SummonedSkull]
      );
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(-1);
    });
    test("equal/strong, has backup", () => {
      const state = getState(
        [Monster.DarkMagician, Monster.HarpieLady],
        [Monster.BlueEyesUltimateDragon, Monster.SummonedSkull]
      );
      expect(getFaceUpTarget(state, makeCoords(0))).toBe(1);
    });
  });
});

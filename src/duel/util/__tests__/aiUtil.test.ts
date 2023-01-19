import { DuellistKey, Monster, RowKey } from "../../common";
import { canAISummonMonster, getWeakestVictorIdx } from "../aiUtil";
import { getNewDuel } from "../duelUtil";
import { generateOccupiedMonsterZone } from "../zoneUtil";

describe("getWeakestVictorIdx", () => {
  const getState = (
    ownMonsters: (Monster | null)[],
    otherMonsters: (Monster | null)[]
  ) => {
    let state: Duel = getNewDuel();
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

  test("0v0", () => {
    const state = getState([], []);
    expect(getWeakestVictorIdx(state, "p1", 0)).toBe(-1);
  });
  test("0v1", () => {
    const state = getState([], [Monster.Kuriboh]);
    expect(getWeakestVictorIdx(state, "p1", 0)).toBe(-1);
  });
  test("1v1", () => {
    const state = getState([Monster.Kuriboh], [Monster.TheUnhappyMaiden]);
    expect(getWeakestVictorIdx(state, "p1", 0)).toBe(0);
  });
  test("1v1, non-first idxs", () => {
    const state = getState(
      [null, Monster.Kuriboh],
      [null, null, null, Monster.TheUnhappyMaiden]
    );
    expect(getWeakestVictorIdx(state, "p1", 3)).toBe(1);
  });
  test("2v1, avoid killing self", () => {
    const state = getState(
      [Monster.PotTheTrick, Monster.DarkMagician],
      [Monster.TheUnhappyMaiden]
    );
    expect(getWeakestVictorIdx(state, "p1", 0)).toBe(1);
  });
  test("2v1, choose weaker atk", () => {
    const state = getState(
      [Monster.BlackLusterSoldier, Monster.Kuriboh],
      [Monster.TheUnhappyMaiden]
    );
    expect(getWeakestVictorIdx(state, "p1", 0)).toBe(1);
  });
  test("2v1, avoid mutual destruction when possible", () => {
    const state = getState(
      [Monster.Kuriboh, Monster.TheUnhappyMaiden],
      [Monster.TheUnhappyMaiden]
    );
    expect(getWeakestVictorIdx(state, "p1", 0)).toBe(0);
  });
  test("2v1, accept mutual destruction when last resort", () => {
    const state = getState(
      [Monster.PotTheTrick, Monster.TheUnhappyMaiden],
      [Monster.TheUnhappyMaiden]
    );
    expect(getWeakestVictorIdx(state, "p1", 0)).toBe(1);
  });
});

describe("canAISummonMonster", () => {
  const getState = (
    hand: (Monster | null)[],
    ownMonsters: (Monster | null)[]
  ) => {
    let state: Duel = getNewDuel();
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

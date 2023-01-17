import { Monster } from "../../common";
import { getWeakestVictorIdx } from "../aiUtil";
import { getNewDuel } from "../duelUtil";
import { generateOccupiedMonsterZone } from "../zoneUtil";

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

describe("getWeakestVictorIdx", () => {
  const empty: EmptyZone = {
    isOccupied: false,
  };
  const weak = {
    ...generateOccupiedMonsterZone(Monster.Kuriboh),
  };
  const strong = {
    ...generateOccupiedMonsterZone(Monster.DarkMagician),
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

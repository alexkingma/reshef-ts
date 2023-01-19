import { DuellistKey, Monster, RowKey } from "../../common";
import { getNewDuel } from "../duelUtil";
import { getHighestAtkZoneIdx } from "../rowUtil";
import { generateOccupiedMonsterZone } from "../zoneUtil";

describe("getHighestAtkZoneIdx", () => {
  const getState = (ownMonsters: (Monster | null)[]) => {
    let state: Duel = getNewDuel();
    state.p1.monsterZones.forEach((z, i, zones) => {
      const c = ownMonsters[i];
      zones[i] = c ? generateOccupiedMonsterZone(c) : { isOccupied: false };
    });
    return state;
  };
  const makeCoords = (): RowCoords => [DuellistKey.Player, RowKey.Monster];

  test("strong vs weak", () => {
    const state = getState([Monster.DarkMagician, Monster.Kuriboh]);
    expect(getHighestAtkZoneIdx(state, makeCoords())).toEqual(0);
  });
  test("weak vs strong", () => {
    const state = getState([Monster.Kuriboh, Monster.DarkMagician]);
    expect(getHighestAtkZoneIdx(state, makeCoords())).toEqual(1);
  });
  test("only one monster", () => {
    const state = getState([null, null, Monster.Kuriboh]);
    expect(getHighestAtkZoneIdx(state, makeCoords())).toEqual(2);
  });
  test("no monsters", () => {
    const state = getState([]);
    expect(getHighestAtkZoneIdx(state, makeCoords())).toEqual(-1);
  });
  test("tied atk => first", () => {
    const state = getState([Monster.DarkMagician, Monster.SummonedSkull]);
    expect(getHighestAtkZoneIdx(state, makeCoords())).toEqual(0);
  });
});

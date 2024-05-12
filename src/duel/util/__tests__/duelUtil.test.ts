import { DKey, RowKey } from "@/duel/enums/duel";
import { Monster } from "@/duel/enums/monster";
import { describe, expect, test } from "vitest";
import { CARD_NONE } from "../common";
import { getNewDuel } from "../duelUtil";
import { getHighestAtkZoneIdx } from "../rowUtil";
import { generateOccupiedMonsterZone } from "../zoneUtil";

describe("getHighestAtkZoneIdx", () => {
  const getState = (ownMonsters: (Monster | null)[]) => {
    const state = getNewDuel();
    state.duellists[DKey.Player].monsterZones.forEach((_, i, zones) => {
      const c = ownMonsters[i];
      zones[i] = c ? generateOccupiedMonsterZone(c) : { id: CARD_NONE };
    });
    return state;
  };
  const makeCoords = (): RowCoords => [DKey.Player, RowKey.Monster];

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

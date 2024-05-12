import { DuellistKey, RowKey } from "@/duel/enums/duel";
import { Monster } from "@/duel/enums/monster";
import { describe, expect, test } from "vitest";
import { CARD_NONE } from "../common";
import { getNewDuel } from "../duelUtil";
import {
  generateOccupiedMonsterZone as createZone,
  getZone,
  specialSummon,
} from "../zoneUtil";

const ownMonsters: RowCoords = [DuellistKey.Player, RowKey.Monster];

describe("special summon", () => {
  test("empty field", () => {
    const state = getNewDuel();
    specialSummon(state, DuellistKey.Player, Monster.Ameba);
    const z0 = getZone(state, [...ownMonsters, 0]);
    const z1 = getZone(state, [...ownMonsters, 1]);
    expect(z0.id).toEqual(Monster.Ameba);
    expect(z1.id).toEqual(CARD_NONE);
  });
  test("summon to non-first", () => {
    const state = getNewDuel();
    state.p1.monsterZones[0] = createZone(Monster.Aeris);
    specialSummon(state, DuellistKey.Player, Monster.Ameba);
    const z0 = getZone(state, [...ownMonsters, 0]);
    const z1 = getZone(state, [...ownMonsters, 1]);
    const z2 = getZone(state, [...ownMonsters, 2]);
    expect(z0.id).toEqual(Monster.Aeris);
    expect(z1.id).toEqual(Monster.Ameba);
    expect(z2.id).toEqual(CARD_NONE);
  });
  test("summon to first with non-empty field", () => {
    const state = getNewDuel();
    state.p1.monsterZones[4] = createZone(Monster.Aeris);
    specialSummon(state, DuellistKey.Player, Monster.Ameba);
    const z0 = getZone(state, [...ownMonsters, 0]);
    const z1 = getZone(state, [...ownMonsters, 1]);
    const z4 = getZone(state, [...ownMonsters, 4]);
    expect(z0.id).toEqual(Monster.Ameba);
    expect(z1.id).toEqual(CARD_NONE);
    expect(z4.id).toEqual(Monster.Aeris);
  });
  test("don't summon to full field", () => {
    const state = getNewDuel();
    state.p1.monsterZones[0] = createZone(Monster.Aeris);
    state.p1.monsterZones[1] = createZone(Monster.Aeris);
    state.p1.monsterZones[2] = createZone(Monster.Aeris);
    state.p1.monsterZones[3] = createZone(Monster.Aeris);
    state.p1.monsterZones[4] = createZone(Monster.Aeris);
    specialSummon(state, DuellistKey.Player, Monster.Ameba);
    const z0 = getZone(state, [...ownMonsters, 0]);
    const z1 = getZone(state, [...ownMonsters, 1]);
    const z2 = getZone(state, [...ownMonsters, 2]);
    const z3 = getZone(state, [...ownMonsters, 3]);
    const z4 = getZone(state, [...ownMonsters, 4]);
    expect(z0.id).toEqual(Monster.Aeris);
    expect(z1.id).toEqual(Monster.Aeris);
    expect(z2.id).toEqual(Monster.Aeris);
    expect(z3.id).toEqual(Monster.Aeris);
    expect(z4.id).toEqual(Monster.Aeris);
  });
});

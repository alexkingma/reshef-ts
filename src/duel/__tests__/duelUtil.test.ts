import { Monster } from "../common";
import { generateOccupiedMonsterZone, getHighestAtkZoneIdx } from "../duelUtil";

describe("getHighestAtkZoneIdx", () => {
  const empty: EmptyZone = {
    isOccupied: false,
  };
  const weak = {
    ...generateOccupiedMonsterZone(Monster.Kuriboh),
  };
  const strong = {
    ...generateOccupiedMonsterZone(Monster.DarkMagician),
  };

  test("weak vs strong", () => {
    expect(getHighestAtkZoneIdx([strong, weak])).toEqual(0);
    expect(getHighestAtkZoneIdx([weak, strong])).toEqual(1);
  });
  test("only one monster", () => {
    expect(getHighestAtkZoneIdx([empty, empty, weak])).toEqual(2);
    expect(getHighestAtkZoneIdx([empty, strong, empty])).toEqual(1);
  });
  test("no monsters", () => {
    expect(getHighestAtkZoneIdx([empty, empty, empty, empty, empty])).toEqual(
      -1
    );
  });
});
